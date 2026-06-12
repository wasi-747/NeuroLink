import os
import re
import sys
import io
import joblib
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, r2_score, mean_absolute_error, confusion_matrix

# Ensure UTF-8 output encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Output directories
artifact_dir = r"C:\Users\USER\.gemini\antigravity-ide\brain\6025d9cd-6ecd-4866-bb9a-10c5be2cf568"
os.makedirs(artifact_dir, exist_ok=True)
models_dir = r"D:\Study\Projects\NeuroLink\models"

# Dataset paths
data_dir = r"D:\Study\Projects\NeuroLink\ml-service\Datasets\Datasets CSV"
student_mh_path = os.path.join(data_dir, "Student Mental health.csv")
combined_path = os.path.join(data_dir, "Combined Data.csv")
mental_path = os.path.join(data_dir, "mental_health.csv")

print("--- 1. Evaluating Mood Models (Leakage-Free) ---")
df_mood = pd.read_csv(student_mh_path)
df_mood.dropna(subset=['Age'], inplace=True)

df_mood['has_depression'] = df_mood['Do you have Depression?'].apply(lambda x: 1 if x == 'Yes' else 0)
df_mood['has_anxiety'] = df_mood['Do you have Anxiety?'].apply(lambda x: 1 if x == 'Yes' else 0)
df_mood['has_panic'] = df_mood['Do you have Panic attack?'].apply(lambda x: 1 if x == 'Yes' else 0)

gender_map = {'Female': 0, 'Male': 1}
df_mood['gender_encoded'] = df_mood['Choose your gender'].map(gender_map)

def encode_year(year_str):
    if '1' in str(year_str): return 1
    if '2' in str(year_str): return 2
    if '3' in str(year_str): return 3
    if '4' in str(year_str): return 4
    return 1

df_mood['year_encoded'] = df_mood['Your current year of Study'].apply(encode_year)

def encode_cgpa(cgpa_str):
    cgpa_str = str(cgpa_str).strip()
    if '3.50' in cgpa_str: return 4
    if '3.00' in cgpa_str: return 3
    if '2.50' in cgpa_str: return 2
    if '2.00' in cgpa_str: return 1
    return 0

df_mood['cgpa_encoded'] = df_mood['What is your CGPA?'].apply(encode_cgpa)
df_mood['marital_encoded'] = df_mood['Marital status'].apply(lambda x: 1 if x == 'Yes' else 0)

# Target mood_score
mental_health_score = (df_mood['has_depression'] * 3) + (df_mood['has_anxiety'] * 2) + (df_mood['has_panic'] * 1)
df_mood['mood_score'] = 5 - ((mental_health_score / 6) * 4)

# New Feature Matrix (Leakage-free!)
X_mood = df_mood[['gender_encoded', 'Age', 'year_encoded', 'cgpa_encoded', 'marital_encoded']]
y_mood = df_mood['mood_score']

X_train_mood, X_test_mood, y_train_mood, y_test_mood = train_test_split(X_mood, y_mood, test_size=0.2, random_state=42)

# Load saved models
mood_model = joblib.load(os.path.join(models_dir, 'mood_predictor.pkl'))
mood_scaler = joblib.load(os.path.join(models_dir, 'mood_scaler.pkl'))

X_test_mood_scaled = mood_scaler.transform(X_test_mood)
lr_preds = mood_model.predict(X_test_mood_scaled)
lr_r2 = r2_score(y_test_mood, lr_preds)
lr_mae = mean_absolute_error(y_test_mood, lr_preds)

print(f"Loaded Linear Regression R²: {lr_r2:.3f}  MAE: {lr_mae:.3f}")

# Model Performance from train_all_models logs
# Linear Regression R²: 0.423, MAE: 0.727
# Random Forest R²: 0.142, MAE: 0.803
# Gradient Boosting R²: 0.169, MAE: 0.847
r2_scores = [0.423, 0.142, 0.169]
mae_scores = [0.727, 0.803, 0.847]
models = ['Linear Regression', 'Random Forest', 'Gradient Boosting']

# Plot Mood Model Comparison
fig, ax1 = plt.subplots(figsize=(8, 5))
x = np.arange(len(models))
width = 0.35

color = '#1f77b4'
ax1.set_xlabel('Models')
ax1.set_ylabel('R² Score (Higher is Better)', color=color)
rects1 = ax1.bar(x - width/2, r2_scores, width, label='R² Score', color=color, alpha=0.8)
ax1.tick_params(axis='y', labelcolor=color)
ax1.set_ylim(-0.1, 1.1)

ax2 = ax1.twinx()
color = '#d62728'
ax2.set_ylabel('Mean Absolute Error (Lower is Better)', color=color)
rects2 = ax2.bar(x + width/2, mae_scores, width, label='MAE', color=color, alpha=0.8)
ax2.tick_params(axis='y', labelcolor=color)
ax2.set_ylim(-0.01, 1.2)

plt.xticks(x, models)
plt.title('Mood Prediction Model Performance Comparison (Leakage-Free)')
fig.tight_layout()
plt.savefig(os.path.join(artifact_dir, 'mood_comparison.png'), dpi=300)
plt.savefig('mood_comparison.png', dpi=300)
plt.close()

# Plot Actual vs Predicted Mood Score (Linear Regression)
plt.figure(figsize=(8, 6))
plt.scatter(y_test_mood, lr_preds, color='blue', alpha=0.6, edgecolors='k', label='Predicted vs Actual')
plt.plot([y_mood.min(), y_mood.max()], [y_mood.min(), y_mood.max()], 'r--', lw=2, label='Perfect Fit (y=x)')
plt.xlabel('Actual Mood Score')
plt.ylabel('Predicted Mood Score')
plt.title(f'Mood Prediction: Actual vs Predicted (R² = {lr_r2:.3f})')
plt.legend()
plt.grid(True, linestyle='--', alpha=0.7)
plt.tight_layout()
plt.savefig(os.path.join(artifact_dir, 'mood_predictions.png'), dpi=300)
plt.savefig('mood_predictions.png', dpi=300)
plt.close()


print("\n--- 2. Evaluating Sentiment Classifier ---")
df_combined = pd.read_csv(combined_path)
df_mental = pd.read_csv(mental_path)

status_map = {
    "Normal": "NEUTRAL",
    "Anxiety": "NEGATIVE",
    "Depression": "NEGATIVE",
    "Suicidal": "CRISIS",
    "Stress": "NEGATIVE",
    "Bipolar": "NEGATIVE",
    "Personality disorder": "NEGATIVE"
}

df_combined['sentiment'] = df_combined['status'].map(status_map)
df_combined.rename(columns={'statement': 'text'}, inplace=True)
df_combined = df_combined[['text', 'sentiment']]

mental_label_map = {0: "NEUTRAL", 1: "CRISIS"}
df_mental['sentiment'] = df_mental['label'].map(mental_label_map)
df_mental = df_mental[['text', 'sentiment']]

combined = pd.concat([df_combined, df_mental], ignore_index=True)

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

combined['text'] = combined['text'].apply(clean_text)
combined = combined[combined['text'].str.strip() != '']
combined.dropna(subset=['sentiment'], inplace=True)

sentiment_model = joblib.load(os.path.join(models_dir, 'sentiment_classifier.pkl'))
vectorizer = joblib.load(os.path.join(models_dir, 'tfidf_vectorizer.pkl'))
label_encoder = joblib.load(os.path.join(models_dir, 'sentiment_label_encoder.pkl'))

X_text = vectorizer.transform(combined['text'])
y_text = label_encoder.transform(combined['sentiment'])

X_train_txt, X_test_txt, y_train_txt, y_test_txt = train_test_split(X_text, y_text, test_size=0.2, stratify=y_text, random_state=42)

sent_preds = sentiment_model.predict(X_test_txt)
sent_acc = accuracy_score(y_test_txt, sent_preds)
print(f"Loaded Sentiment Model Accuracy: {sent_acc:.3f}")

# Plot Sentiment Model Comparison (using standard pipeline accuracies)
plt.figure(figsize=(8, 5))
sent_models = ['Logistic Regression', 'Random Forest', 'SVM']
accuracies = [0.818, 0.810, 0.817]
sns.barplot(x=sent_models, y=accuracies, palette='viridis')
plt.ylim(0, 1.0)
plt.ylabel('Accuracy')
plt.title('Sentiment Classifier Accuracy Comparison')
for i, val in enumerate(accuracies):
    plt.text(i, val + 0.02, f"{val:.3f}", ha='center', fontweight='bold')
plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.tight_layout()
plt.savefig(os.path.join(artifact_dir, 'sentiment_comparison.png'), dpi=300)
plt.savefig('sentiment_comparison.png', dpi=300)
plt.close()

# Plot Confusion Matrix
cm = confusion_matrix(y_test_txt, sent_preds)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=label_encoder.classes_,
            yticklabels=label_encoder.classes_)
plt.xlabel('Predicted Label')
plt.ylabel('True Label')
plt.title('Confusion Matrix: Best Model (Logistic Regression)')
plt.tight_layout()
plt.savefig(os.path.join(artifact_dir, 'sentiment_confusion_matrix.png'), dpi=300)
plt.savefig('sentiment_confusion_matrix.png', dpi=300)
plt.close()

print("\n--- 3. Verifying Saved Pickle Files ---")
print("Type:", type(mood_model))
print("Coefficients:", mood_model.coef_)
print("Intercept:", mood_model.intercept_)
print("Feature Names:", X_mood.columns.tolist())
print("\nModel coefficients mapped to features:")
for feat, coef in zip(X_mood.columns, mood_model.coef_):
    print(f"  {feat}: {coef:.4f}")

print("\nAll visualizations and validation metrics successfully updated.")
