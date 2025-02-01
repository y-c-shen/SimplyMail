import ollama
desiredModel= 'deepseek-r1:1.5b'
questionToAsk='''Do not output the <think> summarize the following email into a summary of 3 sentences only. Do not output more than 3 sentences: 
Hello Hellooo ConUHacks IX Participants!

The wait is almost over! ⏳  Before you arrive, here’s everything you need to know to check in smoothly and survive the hackathon like a pro:💻✨

Check-in Procedure:

- Have your ID card ready.
- Open your QR code from your application on the registration website.
- We’ll scan your QR code at check-in—quick and easy!

Important Registration Deadline – No Exceptions!:

- Check-in opens at 7:00 AM and closes at 9:30 AM SHARP. ⏰  
- If you show up late… well, sorry, but you won’t be allowed in. No exceptions, no last-minute please be on time! 🙅‍♂️🙅‍♀️

Join Our Discord & Verify Your Account:

If you haven’t already, join the ConUHacks IX Discord ASAP and verify your account!
All event updates, announcements, and support will be on Discord 🔔 , so don’t miss out!

Discord Link : https://discord.gg/cvKgNkY5 

Hackathon Hygiene Essentials (Yes, this is a 24-hour event, and yes, we want you to stay fresh )

Whether you’re staying overnight or heading home in between, we highly recommend bringing:
- Towel (gym showers are available!🚿 )
- Toothbrush & toothpaste (no one likes morning breath🪥 )
- Hand sanitizer (stay germ-free, stay coding🧴 )
- Deodorant (we love passion, but let’s keep it fresh🧴 )

Hackathon Survival Kit:

To make the most out of your weekend, don’t forget to bring:
- Laptop + charger (yes, people forget these, don’t be that person💻🔌  )
- Headphones (tune in, tune out, code away🎧 )
- Comfy clothes (you’re in for the long haul 🛋️ )
- Your best smile and enthusiasm! 😁🎉

Respect & Community: 

We’re all here to learn, build, and have fun in an inclusive, welcoming environment. Please be respectful to your fellow hackers, mentors, volunteers, and organizers—let’s make this an amazing experience for everyone!🤝

That’s it for now! Set your alarms, join Discord, and get hyped! We can’t wait to see you soon.🤩

Let’s make ConUHacks IX unforgettable!



H A C K C O N C O R D I A  | C O N U H A C K S

technology.hackconcordia@ecaconcordia.ca



“Dream it. Hack it.”  
'''

reponse = ollama.chat(model=desiredModel, messages=[
    {
        'role': 'user',
        'content': questionToAsk,
    }
])

OllamaResponse=reponse['message']['content']

print(OllamaResponse)

with open("OutputOllama.txt", "w", encoding="utf-8") as text_file:
    text_file.write(OllamaResponse)