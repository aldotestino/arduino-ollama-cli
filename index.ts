import { CoreMessage, streamText, tool } from 'ai';
import figlet from 'figlet';
import ora from 'ora';
import inquirer from 'inquirer';
import { ollama } from 'ollama-ai-provider';
import { z } from 'zod';
import LedController from './LedController';

const model = ollama('llama3.2');

async function main() {
  console.log(figlet.textSync('arduino-ollama-cli'));

  const ledController = new LedController(8);
  const spinner = ora('Initializing LED controller...').start();
  await ledController.initialize();
  spinner.succeed('LED controller initialized');

  const messages: CoreMessage[] = [];

  while (true) {
    const { prompt } = await inquirer.prompt([{
      type: 'input',
      name: 'prompt',
      message: 'Ask something (exit to quit):',
    }]);

    if (prompt.trim() === 'exit') {
      ledController.turnOff();
      console.log('Goodbye!');
      process.exit(0);
    }

    messages.push({
      content: prompt,
      role: 'user',
    });

    spinner.start('Thinking...');
    const result = await streamText({
      model,
      tools: {
        led: tool({
          description: 'Turn on, off and get the state of the LED',
          parameters: z.object({
            command: z.enum(['on', 'off', 'toggle', 'state']),
          }),
          execute: async ({ command }) => ({
            command,
            state: ledController.onCommand(command),
          }),
        }),
      },
      maxSteps: 5,
      messages,
      onFinish: result => {
        messages.push(...result.responseMessages);
        console.log(); // go to new line
      }
    });
    spinner.stop();

    for await (const textPart of result.textStream) {
      process.stdout.write(textPart);
    }

  }
}

main();
