const { BankingSystem, Terminal, Validation } = require('./banking_system');

const menu = async () => {
	const account = new BankingSystem(0);

	while (true) {
		try {
			const menuValue = await Terminal.input(
				`=========== Bank Account ==========\nyour balance: Rp. ${account.saldo}\n1. deposit\n2. withdraw\n3. log transaction\n4. exit\n===============================\nselect menu: \t`
			);

			switch (menuValue) {
				case '1':
					Terminal.clear();

					const depositValue = parseInt(await Terminal.input(`=========== DEPOSIT ==========\nyour balance: Rp. ${account.saldo}\nRp. `));
					await account.deposit(Validation.amountValidation(depositValue));
					break;
				case '2':
					Terminal.clear();

					const withdrawValue = parseInt(await Terminal.input(`=========== WITHDRAW ==========\nyour balance: Rp. ${account.saldo}\nRp. `));
					await account.withdraw(Validation.amountValidation(withdrawValue));
					break;
				case '3':
					await account.showLog();
					break;
				case '4':
					const confirmation = await Terminal.input('⚠ Are you sure you want to exit? (y/n)\t');
					if (confirmation === 'y' || confirmation === 'Y') {
						Terminal.output('😎 Thank You!\n\n');
						Terminal.end();
					} else {
						Terminal.clear();
						Terminal.output('Option canceled\n\n');
					}
					break;
				default:
					Terminal.output('\n\n⛔ Invalid input.\nPlease select a valid option.\n\n');
					break;
			}
		} catch (error) {
			Terminal.output(`${error.name}: ${error.message}`);
		}
	}
};

menu();
