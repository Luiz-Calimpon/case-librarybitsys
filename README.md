# DMT Law Case Management System

This is a case management system for DMT Law Office. It allows users to upload, search, and manage legal cases using semantic search capabilities.

## Features

- Upload PDF, DOCX, and TXT files
- Semantic search using SBERT
- Edit and delete cases
- View case details
- Secure file storage

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/dmt-law-case-management.git
   cd dmt-law-case-management
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   - Create a `.env` file in the project root
   - Add the following line: `EDIT_PASSWORD=your_secure_password`

4. Run the application:
   ```
   python app.py
   ```

5. Open a web browser and navigate to `http://localhost:5000`

## Deployment

This application is designed to be deployed on platforms like Heroku:

1. Create a new Heroku app
2. Set the `EDIT_PASSWORD` config var in Heroku
3. Deploy the code to Heroku
4. Ensure you have at least one dyno running the `web` process type

## Usage

- Use the search bar to find specific cases (utilizes semantic search)
- Click on a case title to view its details
- Use the edit and delete buttons to manage cases
- Upload new files using the upload form

## Contributing

Please read `CONTRIBUTING.md` for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.