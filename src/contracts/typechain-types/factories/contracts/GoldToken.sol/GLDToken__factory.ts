/* Autogenerated file. Do not edit manually. */
/* tslint:disable */

import { Contract, ContractFactory, ContractTransactionResponse, Interface } from 'ethers';
import type { Signer, BigNumberish, ContractDeployTransaction, ContractRunner } from 'ethers';
import type { NonPayableOverrides } from '../../../common';
import type { GLDToken, GLDTokenInterface } from '../../../contracts/GoldToken.sol/GLDToken';

const _abi = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'initialSupply',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'allowance',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'needed',
        type: 'uint256',
      },
    ],
    name: 'ERC20InsufficientAllowance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'balance',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'needed',
        type: 'uint256',
      },
    ],
    name: 'ERC20InsufficientBalance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'approver',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidApprover',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidReceiver',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidSender',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidSpender',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const _bytecode =
  '0x608034620003bd576001600160401b0390601f601f1962000a62388190038381018316850186811186821017620003c257859282916040528339602094859181010312620003bd57519362000053620003d8565b926004938481526311dbdb1960e21b8682015262000070620003d8565b916003928381526211d31160ea1b888201528251858111620003a8578454936001948581811c911680156200039d575b8b821014620003885790818584931162000332575b508a90858311600114620002cd57600092620002c1575b505060001982871b1c191690841b1784555b8051948511620002ac5786548381811c91168015620002a1575b898210146200028c5782811162000241575b5087918511600114620001d85784955090849291600095620001cc575b50501b92600019911b1c19161781555b3315620001b457600254908382018092116200019f57506000917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91600255338352828152604083208481540190556040519384523393a36040516106699081620003f98239f35b601190634e487b7160e01b6000525260246000fd5b60249060006040519163ec442f0560e01b8352820152fd5b01519350388062000127565b9291948416928660005284886000209460005b8a898383106200022957505050106200020e575b50505050811b01815562000137565b01519060f884600019921b161c1916905538808080620001ff565b868601518955909701969485019488935001620001eb565b87600052886000208380880160051c8201928b891062000282575b0160051c019084905b828110620002755750506200010a565b6000815501849062000265565b925081926200025c565b602288634e487b7160e01b6000525260246000fd5b90607f1690620000f8565b604187634e487b7160e01b6000525260246000fd5b015190503880620000cc565b908987941691886000528c600020928d6000905b8282106200031a575050841162000301575b505050811b018455620000de565b015160001983891b60f8161c19169055388080620002f3565b8385015186558a979095019493840193018e620002e1565b909150866000528a6000208580850160051c8201928d86106200037e575b918891869594930160051c01915b8281106200036e575050620000b5565b600081558594508891016200035e565b9250819262000350565b60228a634e487b7160e01b6000525260246000fd5b90607f1690620000a0565b604188634e487b7160e01b6000525260246000fd5b600080fd5b634e487b7160e01b600052604160045260246000fd5b60408051919082016001600160401b03811183821017620003c25760405256fe608060408181526004918236101561001657600080fd5b600092833560e01c91826306fdde031461041e57508163095ea7b31461037057816318160ddd1461035157816323b872dd1461025a578163313ce5671461023e57816370a082311461020757816395d89b411461010357508063a9059cbb146100d35763dd62ed3e1461008857600080fd5b346100cf57806003193601126100cf57806020926100a4610524565b6100ac61053f565b6001600160a01b0391821683526001865283832091168252845220549051908152f35b5080fd5b50346100cf57806003193601126100cf576020906100fc6100f2610524565b6024359033610555565b5160018152f35b8383346100cf57816003193601126100cf5780519082845460018160011c90600183169283156101fd575b60209384841081146101ea578388529081156101ce5750600114610196575b505050829003601f01601f191682019267ffffffffffffffff841183851017610183575082918261017f9252826104db565b0390f35b634e487b7160e01b815260418552602490fd5b919250868652828620918387935b8385106101ba575050505083010185808061014d565b8054888601830152930192849082016101a4565b60ff1916878501525050151560051b840101905085808061014d565b634e487b7160e01b895260228a52602489fd5b91607f169161012e565b5050346100cf5760203660031901126100cf5760209181906001600160a01b0361022f610524565b16815280845220549051908152f35b5050346100cf57816003193601126100cf576020905160128152f35b9050823461034e57606036600319011261034e57610276610524565b61027e61053f565b916044359360018060a01b0383168083526001602052868320338452602052868320549160001983036102ba575b6020886100fc898989610555565b86831061032257811561030b5733156102f4575082526001602090815286832033845281529186902090859003905582906100fc876102ac565b8751634a1406b160e11b8152908101849052602490fd5b875163e602df0560e01b8152908101849052602490fd5b8751637dc7a0d960e11b8152339181019182526020820193909352604081018790528291506060010390fd5b80fd5b5050346100cf57816003193601126100cf576020906002549051908152f35b90503461041a578160031936011261041a5761038a610524565b602435903315610403576001600160a01b03169182156103ec57508083602095338152600187528181208582528752205582519081527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925843392a35160018152f35b8351634a1406b160e11b8152908101859052602490fd5b835163e602df0560e01b8152808401869052602490fd5b8280fd5b8490843461041a578260031936011261041a578260035460018160011c90600183169283156104d1575b60209384841081146101ea578388529081156101ce575060011461049857505050829003601f01601f191682019267ffffffffffffffff841183851017610183575082918261017f9252826104db565b91925060038652828620918387935b8385106104bd575050505083010185808061014d565b8054888601830152930192849082016104a7565b91607f1691610448565b6020808252825181830181905290939260005b82811061051057505060409293506000838284010152601f8019910116010190565b8181018601518482016040015285016104ee565b600435906001600160a01b038216820361053a57565b600080fd5b602435906001600160a01b038216820361053a57565b916001600160a01b0380841692831561061a571692831561060157600090838252816020526040822054908382106105cf575091604082827fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef958760209652828652038282205586815220818154019055604051908152a3565b60405163391434e360e21b81526001600160a01b03919091166004820152602481019190915260448101839052606490fd5b60405163ec442f0560e01b815260006004820152602490fd5b604051634b637e8f60e11b815260006004820152602490fdfea264697066735822122056015fb46aa44e71cc2c3967c75e5bb0e73bf99563aeaf5a4fd8c927886d918264736f6c63430008160033';

type GLDTokenConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (xs: GLDTokenConstructorParams): xs is ConstructorParameters<typeof ContractFactory> =>
  xs.length > 1;

export class GLDToken__factory extends ContractFactory {
  constructor(...args: GLDTokenConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    initialSupply: BigNumberish,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(initialSupply, overrides || {});
  }
  override deploy(initialSupply: BigNumberish, overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(initialSupply, overrides || {}) as Promise<
      GLDToken & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): GLDToken__factory {
    return super.connect(runner) as GLDToken__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): GLDTokenInterface {
    return new Interface(_abi) as GLDTokenInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): GLDToken {
    return new Contract(address, _abi, runner) as unknown as GLDToken;
  }
}
