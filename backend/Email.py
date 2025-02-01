import ollama
from pymongo_get_database import get_database

class Email:
    def __init__(self, email, email_id):
        self.email = email
        self.email_id = email_id
        self.summarize()
        self.insert_db()

    def summarize(self):
        """
        (self) -> (void)
        Summarizes the key points of an email using a locally installed streamlined version of DeepSeek-r1.
        """
        # LLM Parameters
        desiredModel = 'deepseek-r1:1.5b'
        questionToAsk = 'Summarize the following email in a few concise sentences: "' + self.email + '"'

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
            "email_id" : self.email_id,
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
        dbname = get_database('emails_db')
        collection_name = dbname['emails']
        collection_name.insert_one(self.summary)

# TEST (TO REMOVE LATER)
emailtext = "Unlock New Possibilities This February! As we step into February, it's the perfect time to focus on exploring job opportunities, preparing for summer internships, or refining your professional skills, McGill’s Career Planning Service (CaPS) is here to support you. This month, we’re bringing you exciting workshops, networking events, career fairs, and resources designed to help you confidently navigate your career path. Stay engaged, stay prepared, and maximize the opportunities ahead—your future starts now!"
test1 = Email(emailtext, '11111')