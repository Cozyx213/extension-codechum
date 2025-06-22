
import google.generativeai as genai
import os
from dotenv import load_dotenv
import psycopg2
from flask import Flask, request, render_template, jsonify
import requests
from flask_cors import CORS
import urllib.parse




app = Flask(__name__)
CORS(app) 

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
JWT_KEY = os.getenv("JWT_KEY")

DB_USER = os.getenv("DB_USER")
DB_PASS= os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")
DB_HOST = os.getenv("DB_HOST")  # Cloud SQL Proxy uses localhost



genai.configure(api_key=API_KEY)

def gen_solution(desc):
    prompt = """output only the code and add comments. dont use outside libraries unlesss very 
    nececary  use a main funciton and then another function for the logic. you usually use main
      to oge the inoput and then call the new funciton dont use too much comments just mkae it
        simple and use why""" + desc
    
    model = genai.GenerativeModel('gemini-2.5-pro-preview-05-06')
    try:
        res = model.generate_content(prompt)
        return res.text
    except Exception as e:
        return "errer api gen"
    




def get_db_connection():
    conn = psycopg2.connect(
        host=DB_HOST,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )
    return conn

@app.route('/')
def home():
    conn = get_db_connection()
  
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM solutions")
            solutions = cur.fetchall()
            print(solutions)

            # Commit changes
            conn.commit()

            # Fetch users
            

        return "done delete"

    except Exception as e:
        return f"error {str(e)}"
    finally:
       
        conn.close()
       



@app.route("/submit",methods=["POST"])
def submit():
    title = request.json.get("title")
    desc = request.json.get("desc")
    
    if not title :
        print("missing title")
    if not desc :
        print("missing desc")
   
    print(title,desc)
    conn = get_db_connection()
   
  
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM solutions WHERE title = %s", (title,))
            res = cur.fetchone()
            if res is None:
                solution = gen_solution(desc)
                cur.execute("INSERT INTO  solutions (title,solution) VALUES (%s,%s)", (title,solution))
                conn.commit()
                
                return  jsonify({"id":title})
            else:
                
                return jsonify({"id":title})
           
    except Exception as e:
        return f"error {str(e)}"
    conn.close()
    return "good",200
    

@app.route("/solution",methods=["GET"])
def solution():
    encoded_title = request.args.get("title")
    content_title = urllib.parse.unquote(encoded_title)
    print(content_title)
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM solutions WHERE title = %s", (content_title,))
            res = cur.fetchone()
            if res is None:
                return "error no soluton found "
            return render_template("solution.html", title=content_title, solution=res[2]) 
         
    except Exception as e:
        return f"error in soltion {str(e)}"
    conn.close()
    return "good",200
if __name__ == '__main__':
    app.run(debug=True)