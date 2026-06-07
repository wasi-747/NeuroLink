# NeuroLink / NeuroVerse — Hybrid API-DSA Technical Documentation

This document provides a comprehensive overview of the machine learning and algorithmic architecture of the **NeuroVerse** (developed under the project name **NeuroLink**) student wellness platform. It catalogs the datasets, details the training pipeline, explains key mathematical models, details the API integration, lists our recent troubleshooting notes, and provides a teacher presentation Q&A cheat sheet.

---

## 📋 Table of Contents
1. [Project Overview & Architecture](#-1-project-overview--architecture)
2. [Machine Learning Datasets & Preprocessing](#-2-machine-learning-datasets--preprocessing)
3. [Model Training Pipeline & Features](#-3-model-training-pipeline--features)
4. [API Integration & Recent Troubleshooting](#-4-api-integration--recent-troubleshooting)
5. [Teacher Presentation Q&A Cheat Sheet](#-5-teacher-presentation-qa-cheat-sheet)

---

## 📂 1. Project Overview & Architecture

**NeuroVerse** is an AI-integrated student wellness ecosystem designed to support university students' mental health. It provides daily tracking mechanisms (mood, gratitude, habits, stress quiz), a rich-text private journal, an anonymous peer-to-peer community forum with automated content moderation, a therapist booking system, and educational masterclasses.

The platform utilizes a **Hybrid API-DSA Architecture**, separating the web-facing application servers from the machine learning inference services.

```
+-------------------------------------------------------------+
|                     React Client (Vite)                     |
+-------------------------------------------------------------+
                              ||
                              || HTTP / WebSockets
                              ||
+-------------------------------------------------------------+
|              Main Web Backend (Node.js & Express)            |
|                     - MongoDB / Mongoose                     |
+-------------------------------------------------------------+
                              ||
                              || REST API Inter-Service Calls
                              ||
+-------------------------------------------------------------+
|              FastAPI Machine Learning Microservice          |
|        - Scikit-Learn Regression & NLP Classifiers          |
|        - Graph structures & DFS pathfinding (DSA)           |
+-------------------------------------------------------------+
```

### Architectural Core Concepts:
*   **Decoupled Services:** The main Node.js web server is optimized for high-concurrency, CRUD operations, database queries, and session management. The FastAPI microservice runs in isolation, housing all machine learning models, vectorizers, and graph traversals. This protects the web server from being blocked by CPU-intensive inference or graph computations.
*   **Inter-Service API REST Layer:** The services interact purely via REST APIs. Whenever a student writes a journal entry, Node.js posts the text to FastAPI for classification and stores the resulting sentiment tags in MongoDB.
*   **The Hybrid API-DSA Concept:** By integrating standard REST APIs with graph data structures, the platform implements a **Knowledge Graph** utilizing `networkx`. Resource descriptions are converted into semantic vector embeddings using a SentenceTransformer model, similarities are computed to establish graph edges, and personalized learning paths are calculated using a Depth First Search (DFS) traversal.

---

## 📊 2. Machine Learning Datasets & Preprocessing

The platform utilizes 5 primary datasets stored in `ml-service/Datasets/Datasets CSV/` to drive the intelligence features:

| Dataset File & Citation | Size (Rows × Columns) | Core Purpose | Key Features | Preprocessing Applied |
| :--- | :--- | :--- | :--- | :--- |
| **`Student Mental health.csv`**<br>_Title:_ A Statistical Research on the Effects of Mental Health on Students' CGPA<br>_Author:_ MD Shariful Islam | 101 × 11 | Mood Prediction Model | `Age`, `Choose your gender`, `Your current year of Study`, `What is your CGPA?`, `Do you have Depression?`, `Do you have Anxiety?`, `Do you have Panic attack?` | Mapping categorical answers to numeric encodings, computing continuous target `mood_score`, and applying `StandardScaler` normalization. |
| **`Combined Data.csv`**<br>_Title:_ Sentiment Analysis for Mental Health<br>_Author:_ Suchintika Sarkar | 53,043 × 3 | Sentiment Classifier | `statement`, `status` | Column renaming, mapping clinical diagnoses into three unified sentiment classes, and lowercase regex filtering. |
| **`mental_health.csv`**<br>_Title:_ Mental Health Corpus<br>_Author:_ Reihaneh Namdari | 27,977 × 2 | Sentiment Classifier (Crisis) | `text`, `label` | Mapping binary targets (`0` $\rightarrow$ `NEUTRAL`, `1` $\rightarrow$ `CRISIS`), combined with `Combined Data.csv`, and vectorized. |
| **`Sleep_health_and_lifestyle_dataset.csv`**<br>_Title:_ Sleep Health and Lifestyle Dataset (Synthetic)<br>_Author:_ Laksika Tharmalingam | 374 × 13 | Sleep Insights & Analytics | `Sleep Duration`, `Quality of Sleep`, `Stress Level`, `Occupation`, `Sleep Disorder` | Imputing missing categorical values (filling null `Sleep Disorder` values with `'None'`), computing Pearson correlations, and extracting threshold rules. |
| **`Mental_Health_FAQ.csv`**<br>_Title:_ Mental Health FAQ for Chatbot<br>_Author:_ tolu07 | 98 × 3 | FAQ Knowledge Base | `Question_ID`, `Questions`, `Answers` | Lowercasing, symbol stripping, stopword filtering, and indexing. |

### Resolving Row and Column Mismatch in Sentiment Datasets
A primary challenge was combining `Combined Data.csv` (53,043 rows, 3 cols) and `mental_health.csv` (27,977 rows, 2 cols), which had completely mismatched formats.
1.  **Column Alignment:** In `Combined Data.csv`, the column containing student reflections was named `statement`. This was renamed to `text` to match `mental_health.csv`.
2.  **Unifying Labels:** 
    *   In `Combined Data.csv`, the target column `status` contained granular clinical statuses. These were mapped to three classes: `Normal` $\rightarrow$ **`NEUTRAL`**; and `Anxiety`, `Depression`, `Stress`, `Bipolar`, and `Personality disorder` $\rightarrow$ **`NEGATIVE`**; and `Suicidal` $\rightarrow$ **`CRISIS`**.
    *   In `mental_health.csv`, the target column `label` was binary. It was mapped: `0` $\rightarrow$ **`NEUTRAL`** and `1` $\rightarrow$ **`CRISIS`**.
3.  **Concatenation & Pruning:** The datasets were concatenated into a single DataFrame of **81,020 rows**. Empty statements were dropped, and text cleaning (lowercasing, punctuation stripping, and whitespace collapse) was executed.

---

## ⚙️ 3. Model Training Pipeline & Features

Executing `python training/train_all_models.py` runs the pipeline for 4 tasks, comparing algorithms, and saving the best-performing models to `/models/`.

```
Datasets --> train_all_models.py
              ├── Task 1: Mood Prediction (Linear Regression, Random Forest, Gradient Boosting)
              ├── Task 2: Sentiment Classifier (Logistic Regression, Random Forest, SVM)
              ├── Task 3: Sleep Insights (Rule-based Thresholds & Pearson Correlations)
              └── Task 4: FAQ Knowledge Base (Keyword Search Index)
```

### Task 1: Mood Prediction (Regression)
*   **Goal:** Predict a continuous numerical mood score ($1.0$ to $5.0$) representing student wellness.
*   **Mathematical Formulae for Target Variable:**
    $$\text{mental\_health\_score} = (\text{depression} \times 3) + (\text{anxiety} \times 2) + (\text{panic} \times 1)$$
    $$\text{mood\_score} = 5 - \left(\frac{\text{mental\_health\_score}}{6} \times 4\right)$$
    *Here, depression, anxiety, and panic are binary indicators (1 for present, 0 for absent). The weights reflect clinical severity. A fully symptomatic student maps to a score of `1.0` (Very Low), while a symptom-free student maps to `5.0` (Excellent).*
*   **Why StandardScaler was utilized:** Numerical scaling was applied before training because input columns exist on different scales. `Age` has a range of ~18-40, while indicators (e.g. `has_depression`) are binary (0 or 1). Standard scaling transforms them to have a mean of 0 and standard deviation of 1. Without scaling, linear and gradient-based algorithms would over-index on age simply due to its scale.
*   **Model Selection:** Linear Regression was selected, achieving an $R^2$ of `1.000` and MAE of `0.000`.
    > [!NOTE]
    > The perfect $R^2$ of `1.000` occurs because the target variable `mood_score` is a deterministic linear combination of input variables. Linear Regression mathematically learns these exact parameters, yielding zero error.

### Task 2: Sentiment Classifier (NLP / Classification)
*   **Goal:** Classify reflections into `NEUTRAL`, `NEGATIVE`, or `CRISIS`.
*   **Why TF-IDF Vectorization was utilized:** We initialized `TfidfVectorizer` (ngram range 1-2, max 5,000 features, English stopword exclusion). Simple word counts (CountVectorizer) allow common neutral words like "feel" or "today" to dominate the representation. TF-IDF down-scales high-frequency common words and weights terms carrying emotion (e.g., "worthless", "hopeless", "joyful").
*   **Why `stratify=y_text` was necessary:** The merged dataset has class imbalance (fewer `CRISIS` samples). Using `stratify=y_text` during `train_test_split` guarantees that the training and test sets maintain the exact same proportions of each class, ensuring representativeness and preventing the model from under-learning the minority class.
*   **Model Selection:** Logistic Regression was selected (Accuracy: `0.818`), beating Support Vector Classifier (`0.817`) and Random Forest (`0.810`).

### Task 3: Sleep Insights (Rule-based & Correlations)
Extracts a Pearson correlation matrix from sleep statistics and saves it to `sleep_correlations.json`. It also compiles warning thresholds and wellness recommendations to `sleep_insights.json` for:
*   *Low Sleep:* Duration < 6.0 hours $\rightarrow$ Triggers sleep hygiene tips.
*   *High Stress:* Stress Level > 7 $\rightarrow$ Triggers box breathing and stress guides.
*   *Poor Sleep Quality:* Quality < 5 $\rightarrow$ Triggers mindfulness meditation.

### Task 4: FAQ Knowledge Base (Keyword Search Index)
Tokenizes questions, strips common stopwords, and indexes the high-relevance keywords into a fast dictionary lookup (`faq_knowledge_base.json`).

---

## ⚡ 4. API Integration & Recent Troubleshooting

FastAPI exposes these models via dedicated endpoints (prefixed with `/api/ml`):
1.  **`/api/ml/predict-mood` (POST)**: Receives demographic and clinical checkboxes, scales values, runs the mood regressor, and returns the numeric score and a qualitative label (`Excellent`, `Good`, `Neutral`, `Low`, `Very Low`).
2.  **`/api/ml/analyze-sentiment` (POST)**: Receives journal text, cleans it, runs TF-IDF vectorization and scikit-learn Logistic Regression to identify sentiment (`NEUTRAL`, `NEGATIVE`, `CRISIS`).
3.  **`/api/ml/analyze/sentiment` (POST)**: Evaluates text for immediate crisis keywords. If not matched, triggers a Hugging Face model or falls back to Groq Llama 3.3 to return sentiment, emotions, and a crisis flag.
4.  **`/api/ml/sleep-insights` (POST)**: Evaluates sleep stats against rule-based thresholds and outputs a wellness sleep score, list of habits, and breathing guides.
5.  **`/api/ml/faq-search` (GET)**: Takes a query string, matches token keywords, and returns the top 3 FAQ items.
6.  **`/api/ml/chat` (POST)**: Aria chatbot endpoint. Submits chat history and user context to Groq API (`llama-3.1-8b-instant`) with a strict empathetic system prompt.
7.  **`/api/ml/analyze/weekly-report` (POST)**: Compiles user stats and submits to Groq (`llama-3.3-70b-versatile`) to generate a weekly wellness report under 250 words.
8.  **`/api/ml/learning/build-graph` (POST)**: Builds a `networkx` knowledge graph using SentenceTransformer embeddings of courses, articles, and resources.
9.  **`/api/ml/learning/recommend-path` (POST)**: Performs a Depth First Search (DFS) graph traversal starting from top interest nodes to calculate a learning path.

---

### ⚠️ Troubleshooting: `/api/ml/learning/build-graph` 422 JSON Decode Error
*   **Symptom:** Integration testing with a payload of courses, articles, and resources returned `422 Unprocessable Content`. 
*   **Root Cause:** The Pydantic model (`BuildGraphRequest`) specifies that courses, articles, and resources are arrays of `ContentItem` where the fields `id`, `type`, `title`, and `description` are required strings. The payload sent during testing was truncated, which omitted the `description` field for the last item and left the brackets unclosed. Pydantic failed to decode the malformed JSON, throwing a validation exception.
*   **Resolution:** Modified the Node controller (`server/controllers/learning.js`) to select all required fields (using `.select("id title description")`) and default missing fields to an empty string. The JSON string generation was also fixed to prevent truncation.

#### Correct, Complete JSON Payload Example:
```json
{
  "courses": [
    {
      "id": "60c72b2f9b1d8b2c4c8d5a11",
      "type": "course",
      "title": "Mastering Sleep Habits",
      "description": "An interactive scientific masterclass detailing sleep hygiene guidelines, circadian rhythms, and routine building for active students."
    },
    {
      "id": "60c72b2f9b1d8b2c4c8d5a12",
      "type": "course",
      "title": "Anxiety Management under Pressure",
      "description": "Cognitive behavioral strategies to manage stress, exam nerves, and academic anxiety with practical relaxation techniques."
    }
  ],
  "articles": [
    {
      "id": "60c72b2f9b1d8b2c4c8d5b21",
      "type": "article",
      "title": "Top 10 Tips for Better Rest",
      "description": "A review of environmental factors influencing sleep quality, including noise reduction, lighting, and digital screens."
    },
    {
      "id": "60c72b2f9b1d8b2c4c8d5b22",
      "type": "article",
      "title": "Understanding Stress Signals",
      "description": "How to recognize early warning signs of academic burnout and when to reach out to campus counseling services."
    }
  ],
  "resources": [
    {
      "id": "60c72b2f9b1d8b2c4c8d5c31",
      "type": "resource",
      "title": "4-7-8 Breathing Guide",
      "description": "An audio walkthrough of the 4-7-8 breathing method designed to slow heart rate and ground the nervous system."
    }
  ]
}
```

---

## 🎓 5. Teacher Presentation Q&A Cheat Sheet

*   **Q1: Why did you scale your features for the Mood Prediction model?**
    *   **A:** Algorithms like linear regression calculate gradients based on feature values. Since `Age` has a range of ~18-40, while indicators like `has_depression` are binary (0 or 1), a model might assign disproportionate weight to age simply due to its scale. Standard scaling transforms features to have a mean of 0 and standard deviation of 1, ensuring fair learning.
*   **Q2: Why did you choose TF-IDF Vectorization instead of simple Bag of Words (CountVectorizer)?**
    *   **A:** Bag of Words simply counts occurrences of words, meaning common words (like "feel", "really", "just") dominate the representation without carrying much unique sentiment. **TF-IDF (Term Frequency-Inverse Document Frequency)** scales down the weight of words that appear frequently across all documents, highlighting words that carry specific emotional weight (like "empty", "sad", "hopeless").
*   **Q3: Explain how your Mood Score is calculated. Why didn't you just predict the raw answer values?**
    *   **A:** Instead of predicting binary statuses separately, we want to assess overall student mood. We engineered a target continuous variable (`mood_score` from 1.0 to 5.0). We weighted depression highest (3) because of its clinical severity, followed by anxiety (2) and panic (1). We then normalized the sum and scaled it so that 5.0 represents a healthy baseline and 1.0 represents high distress.
*   **Q4: Why evaluate Mood Prediction with both R² and MAE?**
    *   **A:** **MAE (Mean Absolute Error)** gives us a direct, interpretable measure of error (e.g., "our model is off by 0.35 points on average"). **R² (Coefficient of Determination)** tells us the proportion of variance in the mood score that is predictable from our features, giving us a standardized measure of fit (where 1.0 is perfect and 0.0 is no better than guessing the mean).
*   **Q5: Why did you map different clinical labels (Anxiety, Depression, Suicidal, Personality Disorder) into three sentiment categories (NEUTRAL, NEGATIVE, CRISIS)?**
    *   **A:** The primary goal of the Sentiment Classifier in a student wellness app is triage and safety. Having too many specific classes increases classification difficulty and isn't actionable for the interface. By grouping labels into **NEUTRAL** (standard reflection), **NEGATIVE** (moderate stress needing self-care exercises), and **CRISIS** (severe distress requiring immediate crisis helpline popups), the app can trigger appropriate frontend actions.
*   **Q6: Why did you use `stratify=y_text` in your train-test split for Sentiment Classification?**
    *   **A:** Since the distribution of sentiment classes (Neutral, Negative, Crisis) is imbalanced, a standard random split might lead to a test set with very few crisis instances. Stratification guarantees that the train and test splits maintain the exact same class proportions as the full combined dataset, leading to reliable evaluation.
*   **Q7: Explain how the "DSA" part of your Hybrid API-DSA Architecture works in content recommendation.**
    *   **A:** The Data Structures and Algorithms (DSA) component is implemented in `learning.py`. First, we construct a Knowledge Graph using `networkx`, where each node represents a learning item (course, article, or resource) and each edge weight represents semantic similarity. Semantic similarity is calculated between content title/description embeddings generated by a SentenceTransformer model (edges added if cosine similarity exceeds 0.5). When a user provides interests, we embed the search text, find the top 3 closest starting content nodes, and execute a Depth First Search (DFS) preorder traversal to build a sequential learning path. This uses fundamental graph structures and traversal algorithms in production.
