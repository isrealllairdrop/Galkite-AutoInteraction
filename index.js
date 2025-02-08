import fetch from 'node-fetch';
import cfonts from "cfonts";
import chalk from 'chalk';
import readline from 'readline';
import fs from 'fs';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const interactions = [
  {
    agent_id: "deployment_HlsY5TJcguvEA2aqgPliXJjg",
    request_text: "What is Kite AI?",
    response_text: "Kite AI is a purpose-built Layer 1 blockchain platform designed for AI applications, integrating advanced consensus mechanisms like Proof of AI (PoAI) to ensure fair and transparent collaboration. It features modular tools for developers, high-quality data and model subnets, and a marketplace for AI-powered applications, emphasizing democratization and ownership of AI resources."
  },
  {
    agent_id: "deployment_7sZJSiCqCNDy9bBHTEh7dwd9",
    request_text: "Price of bitcoin",
    response_text: "The current price of bitcoin is $96,222.00."
  },
  {
    agent_id: "deployment_SoFftlsf9z4fyA3QCHYkaANq",
    request_text: "What do you think of this transaction? 0x252c02bded9a24426219248c9c1b065b752d3cf8bedf4902ed62245ab950895b",
    response_text: "Extracted transaction hash: 0x252c02bded9a24426219248c9c1b065b752d3cf8bedf4902ed62245ab950895b\n\nFraud analysis complete. Score: 0.9963699579238892\n\nThe Ethereum transaction with hash 0x252c02bded9a24426219248c9c1b065b752d3cf8bedf4902ed62245ab950895b has been flagged as potentially fraudulent by the fraud detector, receiving a \"POSITIVE\" label and a high score of 0.996, indicating a strong likelihood of fraudulent activity.\n\n"
  }
];

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function loadAddresses() {
  try {
    const data = fs.readFileSync('address.txt', 'utf8');
    return data.split('\n').map(line => line.trim()).filter(line => line);
  } catch (error) {
    console.error(chalk.red('❌ Failed to load address.txt:', error));
    return [];
  }
}

async function main() {
  cfonts.say('NT Exhaust', {
    font: 'block',
    align: 'center',
    colors: ['cyan', 'magenta'],
    background: 'black',
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
    maxLength: '0',
  });

  console.log(chalk.green("=== Telegram Channel : NT Exhaust ( @NTExhaust ) ===\n"));

  const addresses = await loadAddresses();
  if (addresses.length === 0) {
    console.error(chalk.red("❌ No wallet addresses found in address.txt"));
    return;
  }

  const numberOfInteractions = await askQuestion(chalk.yellow("Enter the number of interactions: "));

  for (const walletAddress of addresses) {
    console.log(chalk.blue(`\nUsing wallet: ${walletAddress}`));
    for (let i = 1; i <= parseInt(numberOfInteractions); i++) {
      console.log(chalk.blue(`Processing interaction ${i} of ${numberOfInteractions}`));
      const interaction = interactions[Math.floor(Math.random() * interactions.length)];
      await reportUsage(walletAddress, interaction);
    }
  }

  rl.close();
  console.log(chalk.magenta("⏳ All interactions completed. Waiting 24 hours before restarting..."));
  await new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000));
  main();
}

async function reportUsage(walletAddress, interaction) {
  const postUrl = 'https://quests-usage-dev.prod.zettablock.com/api/report_usage';
  const postPayload = {
    wallet_address: walletAddress,
    agent_id: interaction.agent_id,
    request_text: interaction.request_text,
    response_text: interaction.response_text,
    request_metadata: {}
  };

  const headers = {
    'Accept': '*/*',
    'Content-Type': 'application/json'
  };

  let retries = 3;
  while (retries > 0) {
    try {
      console.log(chalk.cyan(`🔄 Trying interaction with wallet: ${walletAddress}`));
      const response = await fetch(postUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(postPayload)
      });
      
      if (response.status === 429) {
        console.log(chalk.yellow("⚠️ Rate limit exceeded, waiting before retry..."));
        await new Promise(resolve => setTimeout(resolve, 10000));
        continue;
      }

      if (!response.ok) throw new Error(`POST request failed: ${response.status}`);
      
      const data = await response.json();
      console.log(chalk.green(`✅ Success! Got interaction ID: ${data.interaction_id}`));
      await submitInteraction(walletAddress, data.interaction_id);
      return;
    } catch (error) {
      console.error(chalk.red('❌ Error in reportUsage:'), error);
      retries--;
      console.log(chalk.yellow(`Retrying... Attempts left: ${retries}`));
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  console.error(chalk.red(`❌ Failed after multiple attempts for wallet: ${walletAddress}`));
}

async function submitInteraction(walletAddress, interactionId) {
  console.log(chalk.green(`📨 Submitting interaction ID ${interactionId} for wallet ${walletAddress}`));
  // Implement logic if needed, otherwise log success.
}

main();

