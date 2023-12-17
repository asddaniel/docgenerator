import * as vscode from 'vscode';
import { GoogleGenerativeAI } from "@google/generative-ai";

const generative_api_key = "AIzaSyDY78QerX5e30_waM56LSVsVSMIKiOze9U"
const genAI = new GoogleGenerativeAI(generative_api_key);

async function run(prompt: string): Promise<any> {
  const preprompt = "Cher Gemini, je vous prie de me générer une documentation tres detaillee en markdown. Cette documentation sera technique exhaustive et accessible pour un développeur novice. je vais te proposer les contenus d'un ensemble de fichiers source constituant cet application. Veuillez fournir des explications détaillées pour chaque fichier, en mettant l'accent sur les concepts fondamentaux, les structures clés et les étapes essentielles. Assurez-vous que la documentation soit claire, concise et adaptée à un public débutant. Merci d'inclure des exemples pratiques et des annotations pédagogiques pour faciliter la compréhension du développeur. vous pouvez aussi ajouter des liens vers d'autres sources. et je voudrais que le resultat soit en français. voici les fichiers";
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  const result = await model.generateContent(preprompt + ": \n" + prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}

export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log('Congratulations, your extension "docgenerator" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('extension.docgenerator', async() => {

    // The code you place here will be executed every time your command is executed
    // Display a message box to the user

    // Liste des extensions de fichiers prises en charge
    const supportedExtensions = ['ts', 'php', 'blade', 'py', 'c', 'cpp', 'tsx', 'jsx', 'java', 'html', 'css', 'json', 'md', 'xml'];

    // Récupérer les fichiers correspondant aux extensions spécifiées
    const files = await vscode.workspace.findFiles(`**/*.{${supportedExtensions.join(',')}}`);

    // Modifier le modèle de recherche selon vos besoins
    const fileContents = await Promise.all(
      files.map(async (file) => {
        try {
          const name: string = file.fsPath;
          const content = await vscode.workspace.fs.readFile(file);
          return "fichier : " + name + "\n" + content.toString();
        } catch (error) {
          console.error(error);
          return "";
        }
      })
    );
    const text = fileContents.join("\n");
    let  result = await run(text);
	result = "resultat de "+fileContents.length+" fichiers \n" + result;
    vscode.window.showInformationMessage('starting generate documentation!: '+fileContents.length+" files" + result);
    const documentationUri = vscode.Uri.file('./documentations/documentation.md');

    // Écrivez le contenu dans le fichier
    await vscode.workspace.fs.writeFile(documentationUri, Buffer.from(result));

    // Ouvrez le fichier dans l'éditeur
    vscode.commands.executeCommand('vscode.open', documentationUri);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
