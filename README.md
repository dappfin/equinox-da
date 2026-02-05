## Foundry
**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**
## 🛡️ **Quantum Threat Protection**

### **Harvest Now, Decrypt Later Defense**
Equinox DA addresses the most dangerous quantum threat: **"harvest now, decrypt later" attacks**. 

> **Critical Security Note**: Equinox DA uses SHA-3 (FIPS 202) commitments, ensuring that even if a quantum computer is built tomorrow, the historical data stored on Base Sepolia remains computationally infeasible to tamper with.

### **Quantum Resistance Timeline**
- **2024-2026**: Classical computers cannot break our encryption
- **2027-2030**: Early quantum computers may emerge, but our 128-bit quantum resistance remains secure
- **2030+**: Large-scale quantum computers arrive, but our historical data is protected by SHA-3 commitments

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
