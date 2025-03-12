

import pandas as pd
import seaborn as sns
from matplotlib import pyplot as plt
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
from tensorflow.keras.models import Sequential
from keras.layers import Dense, Conv2D, MaxPooling2D, Flatten, Dropout
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import load_model
from keras.preprocessing import image
import numpy as np

# -------------------- STEP 1: BUILD THE MODEL -------------------- #
base_model = MobileNetV2(input_shape=(128,128,3), include_top=False, weights='imagenet')
base_model.trainable = False  # Freeze pre-trained layers

cnn = Sequential([
    base_model,
    Flatten(),
    Dense(128, activation="relu"),
    Dropout(0.3),
    Dense(64, activation="relu"),
    Dropout(0.2),
    Dense(1, activation="sigmoid")  # Binary classification (damage / non-damage)
])

# Compile Model
opt = Adam(learning_rate=0.0001)  # Lower learning rate
cnn.compile(optimizer=opt, loss="binary_crossentropy", metrics=["accuracy"])

# -------------------- STEP 2: IMAGE AUGMENTATION & DATASET LOADING -------------------- #
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=40,
    width_shift_range=0.3,
    height_shift_range=0.3,
    shear_range=0.3,
    zoom_range=0.3,
    horizontal_flip=True,
    brightness_range=[0.7, 1.3],
    fill_mode='nearest'
)

test_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=30,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    brightness_range=[0.8, 1.2]
)

# Load Dataset
train_generator = train_datagen.flow_from_directory(
    r"C:\Users\vishw\Downloads\train_quality",
    target_size=(128, 128),
    batch_size=35,
    class_mode='binary'
)

test_generator = test_datagen.flow_from_directory(
    r"C:\Users\vishw\Downloads\test_quality",
    target_size=(128, 128),
    batch_size=35,
    class_mode='binary'
)

print(train_generator.class_indices)  # Confirm class mapping

# -------------------- STEP 3: TRAIN THE MODEL -------------------- #
history = cnn.fit(
    train_generator,
    steps_per_epoch=len(train_generator),
    epochs=30,  # Train for more epochs
    validation_data=test_generator,
    validation_steps=len(test_generator)
)

print("Training Complete ✅")

# -------------------- STEP 4: SAVE THE TRAINED MODEL -------------------- #
model_path = "building_quality_model.h5"
cnn.save(model_path)
print(f"Model saved successfully at: {model_path} 🎉")

# -------------------- STEP 5: LOAD & TEST SAVED MODEL -------------------- #
loaded_model = load_model(model_path)
print("Model Loaded Successfully ✅")

# -------------------- STEP 6: TESTING THE MODEL ON A SINGLE IMAGE -------------------- #
img_path = r"C:\Users\vishw\Downloads\test_quality\non damage\4 (1).jpg"
img = image.load_img(img_path, target_size=(128,128))  # Load image
img = image.img_to_array(img) / 255.0  # Normalize
img = img.reshape(1,128,128,3)  # Reshape for model input

# Make Prediction
classes = loaded_model.predict(img)
predicted_value = classes[0][0]  # Extract single value

print("Predicted Value:", predicted_value)

# Check Prediction
if predicted_value < 0.5:  # Damage is labeled as 0
    print("Damage ✅")
else:
    print("Non-Damage ❌")
