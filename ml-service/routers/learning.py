from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np
import os
import pickle

router = APIRouter()

# In-memory storage for the graph and embeddings
knowledge_graph = None
content_embeddings = None
content_map = {}

GRAPH_FILE = "knowledge_graph.pkl"

class ContentItem(BaseModel):
    id: str
    type: str
    title: str
    description: str

class BuildGraphRequest(BaseModel):
    courses: List[ContentItem]
    articles: List[ContentItem]
    resources: List[ContentItem]

class RecommendPathRequest(BaseModel):
    interests: List[str]
    activity: List[str]

def _get_model_and_nx():
    """Lazy-load heavy dependencies so the service boots without them."""
    try:
        import networkx as nx
        from sentence_transformers import SentenceTransformer, util
        model = SentenceTransformer('all-MiniLM-L6-v2')
        return nx, model, util
    except ImportError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Learning path service unavailable: missing dependency ({e}). "
                   "Run: pip install sentence-transformers networkx"
        )

@router.post("/build-graph")
async def build_graph(data: BuildGraphRequest):
    """
    Accept all courses, articles, and resources, generate vector embeddings,
    construct a knowledge graph, and save it.
    """
    global knowledge_graph, content_embeddings, content_map

    nx, model, util = _get_model_and_nx()

    all_content = data.courses + data.articles + data.resources
    if not all_content:
        raise HTTPException(status_code=400, detail="No content provided to build graph.")

    # Create embeddings
    corpus = [f"{item.title} {item.description}" for item in all_content]
    embeddings = model.encode(corpus, convert_to_tensor=True)

    # Store embeddings and content map
    content_embeddings = embeddings.cpu().numpy()
    content_map = {item.id: {"item": item, "index": i} for i, item in enumerate(all_content)}

    # Build graph
    G = nx.Graph()
    for i, item in enumerate(all_content):
        G.add_node(item.id, type=item.type, title=item.title)

    # Calculate cosine similarity and add edges
    cosine_scores = util.cos_sim(embeddings, embeddings)

    for i in range(len(all_content)):
        for j in range(i + 1, len(all_content)):
            similarity = cosine_scores[i][j].item()
            if similarity > 0.5:  # Threshold for adding an edge
                G.add_edge(all_content[i].id, all_content[j].id, weight=similarity)

    knowledge_graph = G

    # Save graph using pickle (nx.write_gpickle removed in NetworkX 3.x)
    with open(GRAPH_FILE, "wb") as f:
        pickle.dump({"graph": knowledge_graph, "embeddings": content_embeddings, "content_map": content_map}, f)

    return {"message": "Knowledge graph built and saved successfully."}


@router.post("/recommend-path")
async def recommend_path(data: RecommendPathRequest):
    """
    Receive a user's profile and generate a personalized learning path.
    """
    global knowledge_graph, content_embeddings, content_map

    nx, model, util = _get_model_and_nx()

    if knowledge_graph is None:
        if os.path.exists(GRAPH_FILE):
            try:
                with open(GRAPH_FILE, "rb") as f:
                    saved = pickle.load(f)
                knowledge_graph = saved["graph"]
                content_embeddings = saved["embeddings"]
                content_map = saved["content_map"]
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to load knowledge graph: {e}")
        else:
            raise HTTPException(status_code=503, detail="Knowledge graph not built yet. Please build it first.")

    if not data.interests and not data.activity:
        raise HTTPException(status_code=400, detail="User interests or activity must be provided.")

    # Find relevant starting points
    query_text = " ".join(data.interests) + " " + " ".join(data.activity)
    query_embedding = model.encode(query_text, convert_to_tensor=True).cpu().numpy()

    all_content_ids = list(content_map.keys())
    if not all_content_ids:
        return {"path": []}

    all_embeddings = np.array([content_embeddings[content_map[cid]["index"]] for cid in all_content_ids])

    similarities = util.pytorch_cos_sim(query_embedding, all_embeddings)[0]

    # Get top 3 most similar items as starting points
    top_indices = np.argsort(-similarities.numpy())[:3]
    start_nodes = [all_content_ids[i] for i in top_indices]

    # Traverse the graph to generate a path
    path = []
    visited = set()

    for start_node in start_nodes:
        if start_node not in visited:
            traversal = list(nx.dfs_preorder_nodes(knowledge_graph, source=start_node))
            for node_id in traversal:
                if node_id not in visited:
                    path.append(content_map[node_id]['item'])
                    visited.add(node_id)

    return {"path": path}
