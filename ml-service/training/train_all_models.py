import pandas as pd
import numpy as np
import json
import joblib
import os
import re
import sys
import io
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVC
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import (accuracy_score, classification_report, 
                             confusion_matrix, r2_score, 
                             mean_absolute_error)
import warnings
warnings.filterwarnings('ignore')

# Set standard output encoding to UTF-8 to prevent Windows console errors with emojis
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


os.makedirs('../models', exist_ok=True)
os.makedirs('../data', exist_ok=True)

print("=" * 60)
print("NEUROLINK ML TRAINING PIPELINE")
print("=" * 60)

# Dataset paths
data_dir = r"D:\Study\Projects\NeuroLink\ml-service\Datasets\Datasets CSV"
student_mh_path = os.path.join(data_dir, "Student Mental health.csv")
sleep_path = os.path.join(data_dir, "Sleep_health_and_lifestyle_dataset.csv")
faq_path = os.path.join(data_dir, "Mental_Health_FAQ.csv")
combined_path = os.path.join(data_dir, "Combined Data.csv")
mental_path = os.path.join(data_dir, "mental_health.csv")

# ===========================================================
# TASK 1 — MOOD PREDICTION MODEL
# ===========================================================
print("\n" + "=" * 60)
print("MOOD PREDICTION MODEL")
print("=" * 60)

df_mood = pd.read_csv(student_mh_path)
df_mood.dropna(subset=['Age'], inplace=True)

df_mood['has_depression'] = df_mood['Do you have Depression?'].apply(lambda x: 1 if x == 'Yes' else 0)
df_mood['has_anxiety'] = df_mood['Do you have Anxiety?'].apply(lambda x: 1 if x == 'Yes' else 0)
df_mood['has_panic'] = df_mood['Do you have Panic attack?'].apply(lambda x: 1 if x == 'Yes' else 0)
df_mood['sought_help'] = df_mood['Did you seek any specialist for a treatment?'].apply(lambda x: 1 if x == 'Yes' else 0)

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

mental_health_score = (df_mood['has_depression'] * 3) + (df_mood['has_anxiety'] * 2) + (df_mood['has_panic'] * 1)
df_mood['mood_score'] = 5 - ((mental_health_score / 6) * 4)

X_mood = df_mood[['gender_encoded', 'Age', 'year_encoded', 'cgpa_encoded', 'marital_encoded', 'has_depression', 'has_anxiety', 'has_panic']]
y_mood = df_mood['mood_score']

X_train_mood, X_test_mood, y_train_mood, y_test_mood = train_test_split(X_mood, y_mood, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_mood_scaled = scaler.fit_transform(X_train_mood)
X_test_mood_scaled = scaler.transform(X_test_mood)

lr_mood = LinearRegression()
rf_mood = RandomForestRegressor(n_estimators=100, random_state=42)
gb_mood = GradientBoostingRegressor(n_estimators=100, random_state=42)

lr_mood.fit(X_train_mood_scaled, y_train_mood)
lr_preds = lr_mood.predict(X_test_mood_scaled)
lr_r2 = r2_score(y_test_mood, lr_preds)
lr_mae = mean_absolute_error(y_test_mood, lr_preds)

rf_mood.fit(X_train_mood_scaled, y_train_mood)
rf_preds = rf_mood.predict(X_test_mood_scaled)
rf_r2 = r2_score(y_test_mood, rf_preds)
rf_mae = mean_absolute_error(y_test_mood, rf_preds)

gb_mood.fit(X_train_mood_scaled, y_train_mood)
gb_preds = gb_mood.predict(X_test_mood_scaled)
gb_r2 = r2_score(y_test_mood, gb_preds)
gb_mae = mean_absolute_error(y_test_mood, gb_preds)

mood_models = [('Linear Regression', lr_mood, lr_r2, lr_mae), 
               ('Random Forest', rf_mood, rf_r2, rf_mae), 
               ('Gradient Boosting', gb_mood, gb_r2, gb_mae)]

best_mood_model_info = max(mood_models, key=lambda item: item[2])
best_mood_model_name = best_mood_model_info[0]
best_mood_model = best_mood_model_info[1]
best_r2 = best_mood_model_info[2]

joblib.dump(best_mood_model, '../models/mood_predictor.pkl')
joblib.dump(scaler, '../models/mood_scaler.pkl')

print(f"Linear Regression    R²: {lr_r2:.3f}  MAE: {lr_mae:.3f}")
print(f"Random Forest        R²: {rf_r2:.3f}  MAE: {rf_mae:.3f}")
print(f"Gradient Boosting    R²: {gb_r2:.3f}  MAE: {gb_mae:.3f}")
print(f"✅ Best Model: {best_mood_model_name}")
print(f"✅ Mood model saved to models/mood_predictor.pkl")

# ===========================================================
# TASK 2 — SENTIMENT CLASSIFIER
# ===========================================================
print("\n" + "=" * 60)
print("SENTIMENT CLASSIFIER")
print("=" * 60)

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

vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1,2), stop_words='english', min_df=2)
X_text = vectorizer.fit_transform(combined['text'])

label_encoder = LabelEncoder()
y_text = label_encoder.fit_transform(combined['sentiment'])

X_train_txt, X_test_txt, y_train_txt, y_test_txt = train_test_split(X_text, y_text, test_size=0.2, stratify=y_text, random_state=42)

lr_sent = LogisticRegression(max_iter=1000, random_state=42)
rf_sent = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
svm_sent = SVC(kernel='linear', random_state=42)

lr_sent.fit(X_train_txt, y_train_txt)
lr_sent_preds = lr_sent.predict(X_test_txt)
lr_acc = accuracy_score(y_test_txt, lr_sent_preds)

rf_sent.fit(X_train_txt, y_train_txt)
rf_sent_preds = rf_sent.predict(X_test_txt)
rf_acc = accuracy_score(y_test_txt, rf_sent_preds)

svm_sent.fit(X_train_txt, y_train_txt)
svm_sent_preds = svm_sent.predict(X_test_txt)
svm_acc = accuracy_score(y_test_txt, svm_sent_preds)

sent_models = [('Logistic Regression', lr_sent, lr_acc, lr_sent_preds), 
               ('Random Forest', rf_sent, rf_acc, rf_sent_preds), 
               ('SVM', svm_sent, svm_acc, svm_sent_preds)]

best_sent_model_info = max(sent_models, key=lambda item: item[2])
best_classifier_name = best_sent_model_info[0]
best_classifier = best_sent_model_info[1]
best_acc = best_sent_model_info[2]
best_preds = best_sent_model_info[3]

joblib.dump(best_classifier, '../models/sentiment_classifier.pkl')
joblib.dump(vectorizer, '../models/tfidf_vectorizer.pkl')
joblib.dump(label_encoder, '../models/sentiment_label_encoder.pkl')

print(f"Logistic Regression  Accuracy: {lr_acc:.3f}")
print(f"Random Forest        Accuracy: {rf_acc:.3f}")
print(f"SVM                  Accuracy: {svm_acc:.3f}")
print(f"✅ Best Model: {best_classifier_name}")
print("\nClassification Report:")
print(classification_report(y_test_txt, best_preds, target_names=label_encoder.classes_))
print(f"✅ Sentiment model saved")

# ===========================================================
# TASK 3 — SLEEP INSIGHTS
# ===========================================================
print("\n" + "=" * 60)
print("SLEEP INSIGHTS")
print("=" * 60)

df_sleep = pd.read_csv(sleep_path)
df_sleep['Sleep Disorder'] = df_sleep['Sleep Disorder'].fillna('None')

avg_sleep_by_occupation = df_sleep.groupby('Occupation')['Sleep Duration'].mean()
avg_stress_by_sleep = df_sleep.groupby('Sleep Disorder')['Stress Level'].mean()
sleep_quality_correlation = df_sleep[['Sleep Duration', 'Quality of Sleep', 'Stress Level', 'Physical Activity Level']].corr()

rules = {
    "low_sleep": {
        "threshold": 6.0,
        "recommendations": {
            "articles": ["sleep hygiene", "insomnia tips"],
            "courses": ["Sleep Better Perform Better"],
            "tools": ["4-7-8 Breathing", "Body Scan"],
            "habits": ["sleep 8 hours", "no screens 1hr before bed"]
        }
    },
    "high_stress": {
        "threshold": 7,
        "recommendations": {
            "articles": ["stress management", "exam anxiety"],
            "courses": ["Stress Management for Students"],
            "tools": ["Box Breathing", "5-4-3-2-1 Grounding"],
            "habits": ["meditation 10min", "exercise 30min"]
        }
    },
    "poor_sleep_quality": {
        "threshold": 5,
        "recommendations": {
            "articles": ["sleep quality tips"],
            "courses": ["Mindfulness Meditation"],
            "tools": ["4-7-8 Breathing"],
            "habits": ["meditation 10min", "no caffeine after 2pm"]
        }
    }
}

json.dump(rules, open('../data/sleep_insights.json','w'), indent=2)

correlations = sleep_quality_correlation.to_dict()
json.dump(correlations, open('../data/sleep_correlations.json','w'), indent=2)

print(avg_sleep_by_occupation)
print("✅ Sleep insights saved")

# ===========================================================
# TASK 4 — FAQ KNOWLEDGE BASE
# ===========================================================
print("\n" + "=" * 60)
print("FAQ KNOWLEDGE BASE")
print("=" * 60)

df_faq = pd.read_csv(faq_path)
faq_list = []
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

for index, row in df_faq.iterrows():
    q = str(row['Questions']).strip()
    a = str(row['Answers']).strip()
    
    clean_q = re.sub(r'[^a-zA-Z\s]', '', q.lower())
    words = clean_q.split()
    keywords = [w for w in words if w not in ENGLISH_STOP_WORDS and len(w) > 3]
    
    faq_list.append({
        "id": int(row['Question_ID']),
        "question": q,
        "answer": a,
        "keywords": keywords
    })

json.dump(faq_list, open('../data/faq_knowledge_base.json','w'), indent=2)

print(f"✅ {len(faq_list)} FAQ entries processed")
print("✅ FAQ knowledge base saved")

# ===========================================================
# FINAL SUMMARY PRINT
# ===========================================================
print("\n" + "=" * 60)
print("🎉 NEUROLINK ML TRAINING COMPLETE")
print("=" * 60)
print(f"✅ Mood Prediction Model — Best R²: {best_r2:.3f}")
print(f"✅ Sentiment Classifier  — Best Accuracy: {best_acc:.3f}")
print(f"✅ Sleep Insights        — Rules saved")
print(f"✅ FAQ Knowledge Base    — {len(faq_list)} entries")
print(f"")
print(f"📁 Models saved to: ml-service/models/")
print(f"   - mood_predictor.pkl")
print(f"   - mood_scaler.pkl")
print(f"   - sentiment_classifier.pkl")
print(f"   - tfidf_vectorizer.pkl")
print(f"   - sentiment_label_encoder.pkl")
print(f"")
print(f"📁 Data files saved to: ml-service/data/")
print(f"   - sleep_insights.json")
print(f"   - sleep_correlations.json")
print(f"   - faq_knowledge_base.json")
print("=" * 60)
