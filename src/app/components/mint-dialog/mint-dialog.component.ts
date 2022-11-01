import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, tap} from "rxjs";
import {globalAbi} from "../kobe-card/contractsABI/global";
import {ethers} from 'ethers';



enum State {
  Final = 'Final',
  Mint = 'Mint',
}

@Component({
  selector: 'app-mint-dialog',
  templateUrl: './mint-dialog.component.html',
  styleUrls: ['./mint-dialog.component.scss']
})
export class MintDialogComponent implements OnInit {

  state: State | undefined;
  Step = State;
  provider: any;
  approved$: Observable<'true' | 'false' | 'pending'> | undefined;
  txHash: string = '';

  MyBehaviourSubject = new BehaviorSubject<string>("");
  MyBehaviourObservable = this.MyBehaviourSubject.asObservable()

  constructor(
    private cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    this.state = State.Mint;
    this.cdr.detectChanges();
    const res = await this.mint();
  }

  private fn = () => {
    this.next();
  }

  async next() {
    this.state = await this.calcState();
    this.cdr.detectChanges();
  }

  async calcState(): Promise<State> {
    return State.Mint;

  }

  async mint() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = this.provider.getSigner();
    const contract = new ethers.Contract("0x1585233e4B961f222653DFe642b81116bBb3AcD1", globalAbi, this.provider);
    const estimatedGas = await contract.connect(signer).estimateGas['mint']();
    const result = await contract.connect(signer)['mint']({
      gasLimit: estimatedGas,
      nonce: undefined,
    });
    result.wait();
    this.txHash = result.hash;
    this.MyBehaviourSubject.next(result.hash);
  }


}
