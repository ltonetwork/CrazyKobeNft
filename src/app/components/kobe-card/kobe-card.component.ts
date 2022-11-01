import { Component } from '@angular/core';
import {ethers} from 'ethers';
import {abi as identityABI} from './contractsABI/identity-contract';
import {globalAbi} from "./contractsABI/global";
import {MintDialogComponent} from "../mint-dialog/mint-dialog.component";
import {MatDialog} from "@angular/material/dialog";


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
  projectId = "635a50f97c479a01c50d4656"

  constructor(
    private matDialog: MatDialog
  ) { }

  async mint() {
    if (!window.ethereum) {
      alert('Metamask not found, please install it');
      return
    }
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId != 97) {  // BSC testnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x61' }],
      });
    }

    await window.ethereum.send('eth_requestAccounts');
    this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");// any needed to allow network changes
    this.isAddressKnown().then(async resp => {
        if (resp) {

          this.matDialog.open(MintDialogComponent, {
            height: '400px',
            width: '600px',
            panelClass: 'my-css-class'
          });
          // const signer = this.provider.getSigner();
          // const contract = new ethers.Contract("0x1585233e4B961f222653DFe642b81116bBb3AcD1", globalAbi, this.provider);
          // const estimatedGas = await contract.connect(signer).estimateGas['mint']();
          // const result = await contract.connect(signer)['mint']({
          //   gasLimit: estimatedGas,
          //   nonce: undefined,
          // });
          // console.log("Result: ", result);
          // return result.wait();
        }
        else {
          console.log("Address not known");
          window.open(`http://localhost:4200/accounts/participate/${this.projectId}`,"_self")
        }
      }
    );
  }

  async isAddressKnown() {
    const contractAddress = '0xBA0E036B0Bf7D1C1aF169d4Cf9e49a06A8F3F01a';
    const signer = this.provider.getSigner();
    const address = await signer.getAddress();
    const contract = new ethers.Contract(contractAddress, identityABI, this.provider);
    return contract['isKnown'](address)
  }
}
