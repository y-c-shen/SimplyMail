import ollama
from pymongo_get_database import get_database

desiredModel= 'deepseek-r1:1.5b'
questionToAsk="Describe batman."

response = ollama.generate(
    model=desiredModel, 
    prompt=questionToAsk
)

item_1 = {
  "_id" : "23ertyuio",
  "model" : response['model'],
  "created_at" : response['created_at'],
  "response" : response['response']
}

print(item_1)

dbname = get_database()
collection_name = dbname["test_coll"]
collection_name.insert_one(item_1)