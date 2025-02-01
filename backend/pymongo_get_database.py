from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

def get_database(dbname):
    url = "MONGO LINK"

    # Create a new client and connect to the server
    client = MongoClient(url, server_api=ServerApi('1'))
 
   # Create the database for our example (we will use the same database throughout the tutorial
    return client[dbname]
  
# This is added so that many files can reuse the function get_database()
if __name__ == "__main__":   
  
   # Get the database
   db = get_database()
   print(db)