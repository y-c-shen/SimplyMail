import ollama
from pymongo_get_database import get_database

class Email:
    # Class Variables
    dbname = get_database('emails_db')
    collection_name = dbname['emails']

    def __init__(self, email, email_id):
        self.email = email
        self.email_id = email_id
        
        if True:
            self.summarize()
            self.insert_db()

    def summarize(self):
        """
        (self) -> (void)
        Summarizes the key points of an email using a locally installed streamlined version of DeepSeek-r1.
        """
        # LLM Parameters
        desiredModel = 'deepseek-r1:1.5b'
        questionToAsk = 'Summarize the following email in a few concise sentences: "' + self.email + '" Start by identifying the email sender.'

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
    
#test1 = Email("Hello Yejia Shen, Welcome to ConUHacks IX! Join our Discord server to get important updates, find or complete your team, and access everything you need for the event. ConUHacks IX Discord Make sure to check the Welcome Guide in the server for all the instructions. We can't wait to see you there! If you have already joined the Discord server please ignore this email. Thank you, The HackConcordia Team", 'asfasfsafaf')