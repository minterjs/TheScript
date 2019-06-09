const publicKey = process.env.publicKey || 'Mp841f08036f84eb7c776a8d35d530d072423b5132e53d2408eea45915ef797042';
const address = process.env.address || 'Mxa5af7bc050197c017393eda372a0408791a2f346';
const privateKey = process.env.privateKey;
const coin = process.env.coin || 'MNT';
const coin2 = process.env.cointo || 'DIGRIZ';
const host = process.env.host || 'http://testnet.node.minter.one:8841';
const explorer_api = process.env.explorer_api || 'https://explorer-api.testnet.minter.network/api/v1';
const chainId = process.env.chainId || 2;
const min = process.env.min || 7;
const promils = process.env.promils || 1;

(async () => {
    const MinterJS = require('minterjs')({host, explorer_api, address, privateKey, publicKey, chainId});
    const balances = await MinterJS.balances({address});

    const sells = {
        coinFrom: coin,
        coinTo: coin2,
    };

    console.log(sells);

    const delegations = await MinterJS.delegations({coinToBuy: coin});

    console.log(delegations.totals);

    const amount = parseFloat(balances.find(b => b.coin == coin).amount);

    const promil = promils * delegations.converted / 1000;

    const m = ((promil > min) && promil || min)
    console.log({amount, promil, min, m});

    if (amount > m) {

        if (!delegations.totals[coin] || delegations.totals[coin2] && (delegations.totals[coin][coin] < delegations.converted * 0.75)) {


            const stake = Math.floor(
                parseFloat(balances.find(b => b.coin == coin).amount) * 0.9 * 1000000
            ) / 1000000;

            MinterJS.delegate({
                coin, stake, coinSymbol: coin, message: 'TESTNET'
            }).catch(e => console.log(e.response.data.error.tx_result.log));
        } else {
            MinterJS.sellAllCoins({
                privateKey,
                chainId,
                ...sells,
                feeCoinSymbol: sells.coinTo,
            }).then(r => {
                setTimeout(() => {
                    MinterJS.balances({}).then(balances => {
                        const stake = Math.floor(
                            parseFloat(balances.find(b => b.coin == sells.coinTo).amount) * 0.8 * 1000000
                        ) / 1000000;

                        console.log({stake});

                        const del = {
                            stake, coinSymbol: sells.coinTo, message: 'TESTNET'
                        };
                        console.log(del);
                        MinterJS.delegate(del).catch(e => console.log(e/*.response.data.error.tx_result.log */));
                    });
                }, 10000);
            }).catch(e => console.log(e.response.data.error.tx_result.log));

        }
    }
})();
