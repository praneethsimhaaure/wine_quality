from fastapi import FastAPI, HTTPException 
from pydantic import BaseModel 
import joblib 
import numpy as np 

app = FastAPI(    
    title="Wine Quality",    
    description="Machine Learning Model deployed using FastAPI",    
    version="1.0.0" 
    )

# FILE_ID = "1hV1f-PX8lYDpYneNMwuuf64U0I2Ni8lV"
# MODEL_PATH = "model.pkl"

# # Download model only if it doesn't exist
# if not os.path.exists(MODEL_PATH):
#     print("Model not found. Downloading...")

#     gdown.download(
#         f"https://drive.google.com/uc?id={FILE_ID}",
#         MODEL_PATH,
#         quiet=False
#     )

# else:
#     print("Model already exists. Skipping download.")

# # Load model
# model = joblib.load(MODEL_PATH)

# print("Model loaded successfully!")

MODEL_PATH = "SVM_30.pkl" 
try:    
    model = joblib.load(MODEL_PATH) 
    print("Model type:", type(model))
    print("Has predict_proba:", hasattr(model, "predict_proba"))   
    print("Model loaded successfully") 
except Exception as e:    
    print("Error loading model:", e)    
    model = None

class ClassificationInput(BaseModel):
    fixed_acidity      :     float
    volatile_acidity     :   float
    citric_acid           :  float
    residual_sugar         : float
    chlorides             :  float
    free_sulfur_dioxide    :   int
    total_sulfur_dioxide    :  int
    density              :   float
    pH                   :   float
    sulphates            :   float
    alcohol               :  float
@app.get("/") 
def home():    
    return {        
        "message": "ML Model API is running",        
        "status": "success"    
    }

@app.get("/health") 
def health():    
    if model is None:        
        return {"status": "unhealthy", "model_loaded": False}    
    return {"status": "healthy", "model_loaded": True}

@app.post("/predict") 
def predict(data: ClassificationInput):    
    input_data = np.array([[        
        data.fixed_acidity,     
data.volatile_acidity,     
data.citric_acid,           
data.residual_sugar,        
data.chlorides,             
data.free_sulfur_dioxide,    
data.total_sulfur_dioxide,    
data.density,              
data.pH,                  
data.sulphates,            
data.alcohol                
    ]])    
    probabilities = model.predict_proba(input_data)[0] 
    classes = model.classes_ 
    top_indexes = np.argsort(probabilities)[::-1][:3] 
    results = [] 
    for index in top_indexes:    
        results.append({        
            "category": str(classes[index]),        
            "probability": round(float(probabilities[index]), 4)    
            })
    return {    
        "prediction": results[0]["category"],    
        "top_3": results 
    }