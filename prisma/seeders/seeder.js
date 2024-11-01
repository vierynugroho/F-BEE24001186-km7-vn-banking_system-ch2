import * as argon from 'argon2';
import { prisma } from '../../src/libs/prisma.js';

// Helper function to generate random float numbers for transaction amounts
function getRandomFloat(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

// Helper function to generate random bank name
function getRandomBankName() {
  const bankNames = [
    'BRI',
    'BCA',
    'MANDIRI',
    'BNI',
    'BSI',
    'CIMB',
    'PERMATA',
    'DANAMON',
    'OTHERS',
  ];
  return bankNames[Math.floor(Math.random() * bankNames.length)];
}

// Helper function to generate random user type
function getRandomUserType() {
  const accountsType = ['KTP', 'KTM', 'PASSPORT', 'SIM', 'NPWP'];
  return accountsType[Math.floor(Math.random() * accountsType.length)];
}

async function main() {
  const userCount = 10;
  const transactionsPerUser = 5;
  const hashedPassword = await argon.hash('password');

  const users = await Promise.all(
    Array.from({ length: userCount }).map(async (_, index) => {
      return prisma.users.create({
        data: {
          name: index + 1 === 1 ? `Admin` : `User ${index + 1}`,
          email:
            index + 1 === 1
              ? `admin@example.com`
              : `user${index + 1}@example.com`,
          role: index + 1 === 1 ? 'ADMIN' : 'CUSTOMER',
          password: hashedPassword,
          Profiles: {
            create: {
              identity_type: getRandomUserType(),
              identity_number: `${100000000 + index}`,
              address: `Address ${index + 1}`,
            },
          },
          Bank_Accounts: {
            create: [
              {
                bank_name: getRandomBankName(),
                bank_account_number: `${200000000 + index}`,
                balance: parseFloat(getRandomFloat(1000, 5000)),
              },
              {
                bank_name: getRandomBankName(),
                bank_account_number: `${300000000 + index}`,
                balance: parseFloat(getRandomFloat(1000, 5000)),
              },
            ],
          },
        },
        include: {
          Bank_Accounts: true,
        },
      });
    }),
  );

  const transactions = [];

  for (let i = 0; i < userCount; i++) {
    const user = users[i];

    const sourceAccount = user.Bank_Accounts[0];
    const destinationUser = users[(i + 1) % userCount];
    const destinationAccount = destinationUser.Bank_Accounts[1];

    for (let j = 0; j < transactionsPerUser; j++) {
      transactions.push({
        source_account_id: sourceAccount.id,
        destination_account_id: destinationAccount.id,
        amount: parseFloat(getRandomFloat(100, 1000)),
      });
    }
  }

  await prisma.transactions.createMany({
    data: transactions,
  });

  console.log(
    `${userCount} users and ${transactions.length} transactions seeded.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
