import ollama
from pymongo_get_database import get_database

class Email:
    # Class Variables
    dbname = get_database('emails_db')
    collection_name = dbname['emails']

    def __init__(self, email, email_id):
        self.email = email
        self.email_id = email_id
        
        if self.check_db():
            self.summarize()
            self.insert_db()
        else:
            self.retrieve_db()

    def summarize(self):
        """
        (self) -> (void)
        Summarizes the key points of an email using a locally installed streamlined version of DeepSeek-r1.
        """
        # LLM Parameters
        desiredModel = 'deepseek-r1:1.5b'
        questionToAsk = "Summarize the following email in a few concise bullet points, focusing only on key details. Avoid excessive contact information or promotional details. Format the response with clear bullet points. Here is the email: " + self.email

        # Generate LLM response
        response = ollama.generate(
            model=desiredModel, 
            prompt=questionToAsk
        )

        # Strip <think> section of deepseek-r1 response
        strip_point = '</think>\n\n'
        response['response'] = response['response'][response['response'].find(strip_point) + len(strip_point):]

        # Store Class data in a dictionary (for MongoDB)
        self.summary = {
            "_id" : self.email_id,
            "email" : self.email,
            "model" : response['model'],
            "created_at" : response['created_at'],
            "response" : response['response']
        }

    def insert_db(self):
        """
        (self) -> (void)
        Inserts Email class instance data into MongoDB server database as a new item in the emails 
        collection in the emails_db database.
        """
        self.collection_name.insert_one(self.summary)

    def check_db(self):
        """
        Check if email has already been summarized previously (by checking email id).
        """
        # cursor is a NoneType object if no such query found
        cursor = self.collection_name.find_one({'_id' : self.email_id})
        if cursor is None:
            return True
        return False
    
    def retrieve_db(self):
        cursor = self.collection_name.find({'_id' : self.email_id})
        for one in cursor:
            print(one)
            self.summary = {
                "_id" : self.email_id,
                "email" : self.email,
                "model" : one['model'],
                "created_at" : one['created_at'],
                "response" : one['response']
            }
