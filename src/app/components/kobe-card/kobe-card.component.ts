import { Component } from '@angular/core';
import {ethers} from 'ethers';
import {abi as identityABI} from './contractsABI/identity-contract';


declare global {
  interface Window {
    ethereum:any;
  }
}

@Component({
  selector: 'app-kobe-card',
  templateUrl: './kobe-card.component.html',
  styleUrls: ['./kobe-card.component.scss']
})
export class KobeCardComponent {
  provider: any;

  constructor() { }

  async mint() {
    if (!window.ethereum) {
      alert('Metamask not found, please install it');
      return
    }

    await window.ethereum.send('eth_requestAccounts');
    this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");// any needed to allow network changes
    this.isAddressKnown().then(resp =>
    console.log("Response: ", resp));
  }

  async isAddressKnown() {
    const contractAddress = '0xbBA38836dca7173a4B66D24E48dd0993b0d9Bf17';
    const signer = this.provider.getSigner();
    const address = await signer.getAddress();
    const contract = new ethers.Contract(contractAddress, identityABI, this.provider);
    return contract.isKnown(address)
  }
}
