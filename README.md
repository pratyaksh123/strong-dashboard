# 🏋️ Strong PR Dashboard
<img width="1478" alt="image" src="https://github.com/user-attachments/assets/e7df6be5-b630-49f3-b0d1-fb898db99676" />

<br>
Welcome to the **Strong PR Dashboard**! This app visualizes your personal lifting progress, including key stats for bench press, deadlift, squat, overhead press, and bodyweight. Track your 1RM projections and weekly volume data with ease.

## 📅 Live Demo

Check out the live application here: [strong-dashboard-frontend.vercel.app](https://strong-dashboard-frontend.vercel.app)

### 🔒 Privacy Notice
We value your privacy! Your credentials are **not** stored in any database. The app only uses them to fetch your workout data securely.

---

## 📅 Getting Started Locally

Follow these instructions to set up the project locally with both the **Flask backend** and **Next.js frontend**.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/strong-pr-dashboard.git
cd strong-pr-dashboard
```

### 2. Set Up the Flask Backend
1. Navigate to the Flask directory:
    ```bash
    cd backend
    ```
2. Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```
3. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4. Run the Flask app:
    ```bash
    flask run
    ```

### 3. Set Up the Next.js Frontend
1. Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Create an `.env.local` file in the `frontend` directory with the following:
    ```env
    NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000
    ```
4. Start the Next.js app:
    ```bash
    npm run dev
    ```

Your application should now be running at `http://localhost:3000`!

---

## 🌟 Open Source Contributions Welcome!

We love contributions from the open-source community! Whether you're fixing bugs, adding new features, or improving documentation, your help is appreciated.

### How to Contribute:
1. **Fork** this repository.
2. **Clone** your fork:
    ```bash
    git clone https://github.com/your-username/strong-pr-dashboard.git
    ```
3. **Create a branch** for your feature or bugfix:
    ```bash
    git checkout -b feature/your-feature-name
    ```
4. **Commit** your changes and **push**:
    ```bash
    git add .
    git commit -m "Add your feature"
    git push origin feature/your-feature-name
    ```
5. **Create a pull request** explaining your changes.

### What is Open Source?
Open source means the source code of the project is available for anyone to view, modify, and enhance. By contributing to this project, you're joining a global community of developers passionate about making software better for everyone.

---

## 🌐 License

This project is licensed under the MIT License.

---

Happy lifting and coding! 🏋️‍♂️🌟
