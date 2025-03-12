# 📌 Import Libraries
import pandas as pd
import numpy as np
import re
import string
import nltk
from nltk.corpus import stopwords
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
import joblib

# ✅ Download NLTK Stopwords
nltk.download('stopwords')

# ✅ Load Dataset
file_path = r"C:\Users\vishw\Downloads\synthetic_real_estate_fraud_dataset.csv"
df = pd.read_csv(file_path)

# ✅ Shuffle Data & Remove NaN
df = df.sample(frac=1, random_state=42).reset_index(drop=True)
df.dropna(subset=['Description', 'Is_Fraud', 'Ownership_Verified', 'Duplicate_Listing', 'Image_Manipulated'], inplace=True)

# 🚀 **1. Fraud Detection Model (NLP-Based)** 🚀
# ✅ Split Data for Text Classification
X_train, X_test, y_train, y_test = train_test_split(
    df["Description"], df["Is_Fraud"], test_size=0.2, random_state=42, stratify=df["Is_Fraud"]
)

# ✅ Text Preprocessing Function
def preprocess_text(text):
    text = text.lower()  # Convert to lowercase
    text = re.sub(r'\d+', '', text)  # Remove numbers
    text = text.translate(str.maketrans('', '', string.punctuation))  # Remove punctuation
    words = text.split()
    words = [word for word in words if word not in stopwords.words('english')]  # Remove stopwords
    return " ".join(words)

# Apply Preprocessing
X_train = X_train.apply(preprocess_text)
X_test = X_test.apply(preprocess_text)

# ✅ TF-IDF Vectorization
vectorizer = TfidfVectorizer(max_features=300)  # Use top 300 words
X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

# ✅ Train Fraud Detection Model (Random Forest)
fraud_model = RandomForestClassifier(n_estimators=200, class_weight='balanced', random_state=42)
fraud_model.fit(X_train_tfidf, y_train)

# ✅ Predictions & Evaluation
y_pred = fraud_model.predict(X_test_tfidf)
fraud_accuracy = accuracy_score(y_test, y_pred)
print(f"🔹 Fraud Detection Model Accuracy: {fraud_accuracy:.2f}")
print("\n📊 Classification Report:\n", classification_report(y_test, y_pred))
print("test Accuracy: ",fraud_model.score(X_test_tfidf, y_test))
print("train Accuracy: ",fraud_model.score(X_train_tfidf, y_train))

# 🚀 **2. Ownership Verification Model (Numeric Features)** 🚀
# ✅ Convert Categorical Features to Numeric (Yes/No → 1/0)
df["Duplicate_Listing"] = df["Duplicate_Listing"].map({"Yes": 1, "No": 0})
df["Image_Manipulated"] = df["Image_Manipulated"].map({"Yes": 1, "No": 0})

# ✅ Select Features for Ownership Verification
X_onr = df[["Price", "Duplicate_Listing", "Image_Manipulated"]]  
y_onr = df["Ownership_Verified"]

# ✅ Split Data
X_train_onr, X_test_onr, y_train_onr, y_test_onr = train_test_split(
    X_onr, y_onr, test_size=0.2, random_state=42, stratify=y_onr
)

# ✅ Train Ownership Verification Model (Logistic Regression)
onr_model = LogisticRegression(random_state=42)
onr_model.fit(X_train_onr, y_train_onr)

# ✅ Predictions & Evaluation for ONR
y_pred_onr = onr_model.predict(X_test_onr)
onr_accuracy = accuracy_score(y_test_onr, y_pred_onr)
print(f"\n🔹 Ownership Verification Model Accuracy: {onr_accuracy:.2f}")
print("\n📊 Classification Report (Ownership Verification):\n", classification_report(y_test_onr, y_pred_onr))
print("test Accuracy: ",onr_model.score(X_test_onr, y_test_onr))
print("train Accuracy: ",onr_model.score(X_train_onr, y_train_onr))

# 🚀 **Save Models for Deployment** 🚀
joblib.dump(fraud_model, "fraud_detector.pkl")
joblib.dump(vectorizer, "tfidf_vectorizer.pkl")
joblib.dump(onr_model, "ownership_verification.pkl")

print("\n✅ Models saved successfully for deployment!")
