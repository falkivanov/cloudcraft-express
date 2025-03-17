
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/31bf6325-da9f-4523-b1e4-aa8d48a5ccf6

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/31bf6325-da9f-4523-b1e4-aa8d48a5ccf6) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/31bf6325-da9f-4523-b1e4-aa8d48a5ccf6) and click on Share -> Publish.

## Deploy to STACKIT

Das Projekt kann auf der deutschen Cloud-Plattform STACKIT gehostet werden. Folgen Sie diesen Schritten:

1. Erstellen Sie einen Account bei [STACKIT](https://www.stackit.de/)
2. Installieren Sie die STACKIT CLI
3. Bauen Sie das Projekt mit `npm run build`
4. Verwenden Sie die Kubernetes- oder Container-PaaS-Dienste von STACKIT zum Deployen
5. Alternativ können Sie auch den STACKIT Object Storage für statisches Hosting verwenden:
   ```
   # Beispiel für die Bereitstellung mit der STACKIT CLI (Details können abweichen)
   stackit login
   stackit storage bucket create my-app-bucket
   stackit storage upload --source ./dist --destination my-app-bucket
   ```

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
