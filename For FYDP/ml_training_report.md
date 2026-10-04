# NeuroLink Machine Learning Model Evaluation & Analysis Report (Updated)

This report presents the training visualizations, evaluation metrics, best model comparisons, pickle file checks, and the resolution of the target leakage issue.

---

## 1. Performance Visualizations (Training & Testing Graphs)

Below are the generated graphs comparing model performances and verifying their predictions.

````carousel
![Mood Model Performance Comparison](C:/Users/USER/.gemini/antigravity-ide/brain/6025d9cd-6ecd-4866-bb9a-10c5be2cf568/mood_comparison.png)
<!-- slide -->
![Mood Predictions vs Actual (Linear Regression)](C:/Users/USER/.gemini/antigravity-ide/brain/6025d9cd-6ecd-4866-bb9a-10c5be2cf568/mood_predictions.png)
<!-- slide -->
![Sentiment Classifier Accuracy Comparison](C:/Users/USER/.gemini/antigravity-ide/brain/6025d9cd-6ecd-4866-bb9a-10c5be2cf568/sentiment_comparison.png)
<!-- slide -->
![Confusion Matrix for Logistic Regression Classifier](C:/Users/USER/.gemini/antigravity-ide/brain/6025d9cd-6ecd-4866-bb9a-10c5be2cf568/sentiment_confusion_matrix.png)
````

---

## 2. Evaluation Metrics & Testing Loss

The tables below list the test set performance for every model evaluated in the pipeline.

### A. Mood Prediction Models (Regression)
For regression, the loss functions evaluated are the **Mean Absolute Error (MAE)** and the **R² Score (Coefficient of Determination)**.

> [!NOTE]
> **Resolution of Target Leakage**: Previously, the model scored a perfect $R^2 = 1.000$ due to target leakage columns. After removing the target leakage features (`has_depression`, `has_anxiety`, and `has_panic`) from the training set, the models now achieve realistic, generalization metrics on demographics alone.

| Model | R² Score (Higher is Better) | Mean Absolute Error (MAE - Lower is Better) |
| :--- | :---: | :---: |
| **Linear Regression (Best)** | **0.423** | **0.727** |
| Gradient Boosting Regressor | 0.169 | 0.847 |
| Random Forest Regressor | 0.142 | 0.803 |

### B. Sentiment Classifier Models (Classification)
For multi-class classification (classes: `CRISIS`, `NEGATIVE`, `NEUTRAL`), the metric is **Accuracy** on the test set (16,203 samples).

| Model | Test Accuracy |
| :--- | :---: |
| **Logistic Regression (Best)** | **0.818** |
| Support Vector Machine (SVM) | 0.817 |
| Random Forest Classifier | 0.810 |

---

## 3. Best Model Comparison & Explanations

### Mood Prediction: Linear Regression
- **Why it is the best**: It achieves the highest $R^2 = 0.423$ and lowest $MAE = 0.727$.
- **Explanation**: Demographics (marital status, year of study, age) have structured linear impacts on overall mood score averages in the dataset. Because the underlying demographics represent coarse-grained trend lines without complex interaction splits, the Linear Regression model generalizes significantly better than tree-based ensembles (Random Forest R² = 0.142, Gradient Boosting R² = 0.169), which suffer from overfitting on small datasets when features are few.

### Sentiment Classification: Logistic Regression
- **Why it is the best**: It achieves the highest accuracy of **81.8%** and handles high-dimensional TF-IDF text representations efficiently.
- **Comparison**: 
  - **SVM (81.7%)** performs similarly but is computationally expensive to train and has slower inference speeds.
  - **Random Forest Classifier (81.0%)** lags behind slightly because high-dimensional sparse text vectors (TF-IDF features) are less suited for orthogonal decision boundary splits.
  - **Logistic Regression** offers the best trade-off: it is extremely fast to train, executes predictions with low latency, and achieves the highest overall accuracy.

---

## 4. Pickle File Verification Check

The saved `.pkl` files in [models/](file:///d:/Study/Projects/NeuroLink/models) were loaded and verified programmatically.

### A. Mood Predictor Check
- **File**: `models/mood_predictor.pkl`
- **Status**: Loaded successfully.
- **Type**: `sklearn.linear_model.LinearRegression`
- **Intercept**: `3.558333`
- **Model Coefficients Mapped to Features (on Scaled Inputs)**:
  - `gender_encoded`: `0.0454`
  - `Age`: `0.0768`
  - `year_encoded`: `0.1926`
  - `cgpa_encoded`: `-0.0417`
  - `marital_encoded`: `-0.7692`

*Note: The model has exactly 5 input dimensions, showing that the target leakage columns have been completely removed from the pipeline.*

### B. Sentiment Classifier Check
- **File**: `models/sentiment_classifier.pkl`
- **Status**: Loaded successfully.
- **Type**: `sklearn.linear_model.LogisticRegression`
- **Classes**: `['CRISIS', 'NEGATIVE', 'NEUTRAL']`

---

## 5. How the Target Leakage was Eliminated

> [!TIP]
> **Before vs. After Comparison**
> * **Before (With Leakage)**: R² = 1.000, MAE = 0.000. Features included `has_depression`, `has_anxiety`, and `has_panic`.
> * **After (Leakage Eliminated)**: R² = 0.423, MAE = 0.727. Features restricted to demographics.

### The Leakage Problem
The target `mood_score` was constructed deterministically as a linear function of the clinical status flags:
$$\text{mood\_score} = 5 - 2 \times \text{has\_depression} - 1.3333 \times \text{has\_anxiety} - 0.6667 \times \text{has\_panic}$$
Feeding these same flags into the training features matrix $X$ enabled the model to perfectly learn the mathematical coefficients of the target equation.

### The Solution at the Source
1. **Feature Pruning**: We removed `has_depression`, `has_anxiety`, and `has_panic` from the feature matrix in both training and inference stages.
2. **Clean Demographics Predictor**: The model is now forced to predict the mood score strictly using clean, independent demographic inputs:
   $$X_{\text{clean}} = [\text{gender\_encoded}, \text{Age}, \text{year\_encoded}, \text{cgpa\_encoded}, \text{marital\_encoded}]$$
3. **No API Breaking Changes**: The backend endpoint in [predict.py](file:///d:/Study/Projects/NeuroLink/ml-service/routers/predict.py) still accepts the full frontend request payload containing the checkboxes, but ignores the clinical flags inside the predictive pipeline. This eliminates the leakage without requiring frontend code changes.
