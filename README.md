![screenshot_23062025_010800](https://github.com/user-attachments/assets/61b67cc0-8a8a-4322-a7c7-e56c497a28e6)
# CodeCram: CodeChum Solution Generator

This repository contains a chrome extension and a Flask-based backend that work together to provide automatic coding solutions. When a user visits codechum's study area, the extension injects a “Solution” button onto the page. Clicking this button sends the current problem’s title and description to the backend. The backend then checks if a solution already exists in the database; if not, it uses the Google Generative AI (Gemini API) to generate one, stores it, and displays it for the user.

## Components

### 1. Browser Extension (JavaScript)

-   **Purpose:**  
    Injects a “Solution” button into the page by locating specific DOM elements (title and description) using their CSS classes.
-   **Functionality:**
    -   Reads the problem title and description from the page.
    -   Creates and styles a “Solution” button next to the title.
    -   On button click, sends a POST request to the `/submit` endpoint on the Flask server with the problem details.
    -   Opens the solution in a new tab by navigating to the `/solution` endpoint with an ID (currently using the title as an ID).

### 2. Flask Backend (Python)

-   **Purpose:**  
    Manages solution generation, database interactions, and API endpoints.
-   **Endpoints:**

    -   **`/` (Home):**
        -   Example endpoint that performs database insertion and displays the current users.
    -   **`/submit` (POST):**
        -   Receives JSON data (title and description) from the browser extension.
        -   Checks if a solution for the given problem title exists in the `solutions` table.
        -   If no existing solution is found:
            -   Calls `gen_solution(desc)` to generate a solution using the Gemini API.
            -   Inserts the new solution into the `solutions` table.
        -   Returns an ID (currently the title) to reference the solution.
    -   **`/solution` (GET):**
        -   Extracts an ID (or title) from the query parameters.
        -   Retrieves and displays the associated solution from the database.

-   **Database interaction:**

    -   Uses PostgreSQL via `psycopg2`.
    -   Contains a table named `solutions` that stores the title, generated solution, and creation timestamp.
    -   Also has an example usage with a `public.users` table for demonstration purposes.

-   **External API Integration:**
    -   Uses the `google.generativeai` Python library to generate coding solutions via the Gemini model.
    -   The function `gen_solution(desc)` sends a prompt (constructed from the problem’s description) and returns the generated text solution.

## Setup

### Environment Variables

Create a `.env` file with the following variables:

-   `GOOGLE_API_KEY`: Your API key for the Generative AI service.
-   `JWT`: (If used) Your JWT secret key.
-   `DB_USER`: Database username.
-   `DB_PASS`: Database password.
-   `DB_NAME`: Database name.
-   `DB_HOST`: Host (for Cloud SQL Proxy, use `localhost`).

### Python Dependencies

Install required Python packages:

```bash
pip install flask flask-cors psycopg2 google-generativeai python-dotenv
```

### Database

Create the necessary tables in your PostgreSQL database:

```sql
DROP TABLE IF EXISTS solutions;
CREATE TABLE solutions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    solution VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS public.users;
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Running the Application

1. **Start the Flask Backend:**
    ```bash
    python app.py
    ```
2. **Load the Browser Extension:**
    - Bundle or load your extension in your browser to inject the solution button on codechum study-area pages.

## Workflow

1. **User Action:**
    - When a user clicks the "Solution" button on the problem page, the extension collects the title and description and posts them to the `/submit` endpoint.
2. **Server Processing:**
    - The backend checks for an existing solution. If not found, it calls the Gemini API to generate a solution and stores it in PostgreSQL.
3. **Displaying Results:**
    - The user is redirected (via a new tab) to the `/solution` endpoint, which fetches and renders the solution.

## Notes

-   **Error Handling:**  
    Ensure proper error logging and handling is in place for production use.
-   **Security:**  
    Sensitive operations and API keys should be secured using environment variables and/or secret management.
-   **Performance:**  
    Consider using caching or connection pooling for database operations if scaling is required.

This repository serves as a basic example of integrating frontend browser extensions with a Flask backend and utilizing Generative AI for dynamic coding solutions.   :< :>