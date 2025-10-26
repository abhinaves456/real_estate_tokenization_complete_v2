// Simple web3 helper (demo)
import Web3 from 'web3';
const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:8545');
export default web3;
