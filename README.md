# Extension VS Code - Gemini Docs Generator

by Daniel Assani
## Description

Welcome to the Gemini Docs Generator, a Visual Studio Code extension developed in TypeScript that harnesses the power of Google's Gemini AI to automate the generation of technical and explanatory documentation for your applications.

## Features

- **Easy Integration**: Seamlessly integrate Gemini Docs Generator into your VS Code workflow.
- **Effortless Documentation**: Generate comprehensive technical documentation with a single command.
- **Google's Gemini AI**: Leverage the capabilities of Google's advanced Gemini AI for intelligent documentation generation.

## Prerequisites

Ensure you have the following prerequisites installed before using the extension:

- Visual Studio Code
- Node.js and npm

## Installation

1. Open Visual Studio Code.
2. Go to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window, or press `Ctrl+Shift+X`.
3. Search for "DocGenerator" and click on the install button.

## Usage

1. Open your project in Visual Studio Code.
2. Open the VS Code terminal.
3. Type the following command to generate documentation:

    ```
    creer documentation
    ```

4. Sit back and let Gemini AI work its magic to generate comprehensive documentation for your application.

## Configuration

Customize the extension by modifying the settings in your VS Code settings.json file. You can specify parameters such as output format, destination folder, and more.

```json
{
  "geminiDocsGenerator.outputFormat": "markdown",
  "geminiDocsGenerator.outputFolder": "documentation"
}