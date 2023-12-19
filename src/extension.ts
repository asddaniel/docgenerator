import * as vscode from 'vscode';
import { GoogleGenerativeAI } from "@google/generative-ai";

const generative_api_key = "AIzaSyDY78QerX5e30_waM56LSVsVSMIKiOze9U"
const genAI = new GoogleGenerativeAI(generative_api_key);

async function run(prompt: string[], root:string): Promise<any> {
  let preprompt =
    "Cher Gemini, je vous prie de me générer une documentation tres detaillee en markdown. Cette documentation sera technique exhaustive et accessible pour un développeur novice. je vais te proposer les contenus d'un ensemble de fichiers source constituant cet application. Veuillez fournir des explications détaillées de l'application du point de vue globale et particulier, en mettant l'accent sur les concepts fondamentaux, les structures clés et les étapes essentielles. Assurez-vous que la documentation soit claire, concise et adaptée à un public débutant, et j'insiste sur le fait qu'elle doit etre bien structurée et professionelle et non seulement des explications sur chaque fichier. Merci d'inclure des exemples pratiques et des annotations pédagogiques pour faciliter la compréhension du développeur. vous pouvez aussi ajouter des liens vers d'autres sources. voici les fichiers";

  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  // const chunkSize = 20000;
  // const chunks = [];
  // for (let i = 0; i < prompt.length; i += chunkSize) {
  //   chunks.push(prompt.substring(i, i + chunkSize));
  // }

  let result: any;
   let text = "";
   let index = 0;
  for (const chunk of prompt) {
    result = await model.generateContent(preprompt + ": \n" + chunk);
    const response = await result.response;
    preprompt = "ecris moi la suite de la documentation suivante en fonction des nouvelles donnees que je n'ai pas consideree dans la documentation precedente.  mais reste toujours coherente dans ton discours, tiens seulement compte qu'il y a des codes supplementaires et que ton discours ne doit en aucun cas reprendre ce qui etait dans la partie precedente ni mettre des conclusions, ni ecrire des formules de politesse, voici la documentation : "+response.text()+". et le code ajoutee  est ici: \n";
    text = response.text();
    vscode.window.showInformationMessage("etape : " + (index + 1) );
    const randomname = "umentation"+index.toString();
    index++; //Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const documentationUri = vscode.Uri.file(root +"/documentations/doc"+ randomname + '.md');
    // Écrivez le contenu dans le fichier
    await vscode.workspace.fs.writeFile(documentationUri, Buffer.from(text));
    // Call the update function to modify the response
    text = await updateResponse(text);
  }

  return text;
}

async function updateResponse(response: string): Promise<string> {
  // Implement your logic to update the response here
  // For example, you can process the response or make additional API calls

  // For demonstration purposes, let's just add a prefix to the response
  return  response;
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
    const excludedfolders = ["node_modules", ".git", "dist", "build", "vendor", "tests"];
      // Afficher une boîte de dialogue d'entrée
      vscode.window.showInputBox({ prompt: 'donnez le nom du dossier racine de votre application:' }).then(async (valeurSaisie) => {
        if (valeurSaisie) {
            // Faire quelque chose avec la valeur saisie par l'utilisateur
            // Récupérer les fichiers correspondant aux extensions spécifiées
            let folder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file("/"));
             const totext = folder?.uri.fsPath;
             const folderPath = vscode.workspace.workspaceFolders?.map((folder) => {
               return folder.uri.fsPath;
             });
             let datafile = "";
             let dossiers = await vscode.workspace.workspaceFolders?.map((folder) => {
               return folder.uri.fsPath;
             }).join(",");
             if(dossiers===undefined){
               dossiers = "";
             }
            //  for (const folder of folderPath) {
            //      datafile + folder?.uri.fsPath;
            //  }
            
    let racinefolder = folderPath?.join(",").toString()??"";
    if(racinefolder===undefined){
      racinefolder = "";
    }
    const root = racinefolder;
    racinefolder = racinefolder.charAt(0).toUpperCase()+racinefolder.slice(1)+("/"+valeurSaisie+"\\").replace("/", "\\");
             vscode.window.showInformationMessage('starting generate documentation!: '+dossiers.toString());



    const files = await vscode.workspace.findFiles(new vscode.RelativePattern(racinefolder,`**/*.{${supportedExtensions.join(',')}}`));

    // Modifier le modèle de recherche selon vos besoins
    let contentchunk = "";
    let contentArray:string[] = [];
    const fileContents = await Promise.all(
      files.slice(0, 60).map(async (file) => {
        try {
          const name: string = file.fsPath;
          // if(!name.startsWith(racinefolder)){
          //   return name+"\n";
          // }
          const content = await vscode.workspace.fs.readFile(file);
          const resultat = "fichier : " + name + "\n" + content.toString(); 
          if((contentchunk.length + resultat.length)> 20000){
              contentArray.push(contentchunk);
              contentchunk = "";
          }
          contentchunk += resultat + "\n";
          return resultat; 
        } catch (error) {
          console.error(error);
          return "";
        }
      })
    );
    let text = fileContents.join("\n");
    // text = text.substring(0, 25000);
    if(contentArray.length===0){
      contentArray.push(contentchunk);
    }
    vscode.window.showInformationMessage('generation de la documentation!: '+fileContents.length+" fichiers");
    let  result = await run(contentArray, root);
	//result = "resultat de "+fileContents.length+" fichiers \n" + result;
    vscode.window.showInformationMessage('generation de la documentation terminee! : '+fileContents.length+" fichiers et " + text.length+" lignes");
    const randomname = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const documentationUri = vscode.Uri.file(root +"/doc"+ randomname + '.md');

    // Écrivez le contenu dans le fichier
    await vscode.workspace.fs.writeFile(documentationUri, Buffer.from(result));

    // Ouvrez le fichier dans l'éditeur
    vscode.commands.executeCommand('vscode.open', documentationUri);
        }
      });
    
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
