from fastapi import FastAPI, HTTPException
import pickle
import numpy as np

model = pickle.load(open("model.pkl", "rb"))
dataset = pickle.load(open("dataset.pkl", "rb"))
type_lookup = pickle.load(open("type_lookup.pkl", "rb"))  # ✅ must exist

app = FastAPI()

@app.get("/recommend/{user_id}")
def recommend(user_id: int, num: int = 10):
    user_map = dataset.mapping()[0]
    item_map_rev = {v: k for k, v in dataset.mapping()[2].items()}

    if user_id not in user_map:
        raise HTTPException(status_code=404, detail="User not found")

    internal_uid = user_map[user_id]
    scores = model.predict(internal_uid, np.arange(len(item_map_rev)))
    top_items = np.argsort(-scores)[:num]
    recommended_ids = [item_map_rev[i] for i in top_items]

    return {
        "user_id": user_id,
        "recommendations": [
            {"id": item_id, "type": type_lookup[item_id]}
            for item_id in recommended_ids if item_id in type_lookup
        ]
    }
