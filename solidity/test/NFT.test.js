const truffleAssert = require("truffle-assertions");
const Web3 = require("web3");
const web3 = new Web3();
const NFT = artifacts.require("./NFT.sol");
const DummyProvider = artifacts.require("./DummyProvider.sol");
const MockContract = artifacts.require("./MockContract.sol");
const linkABI = require("../abi/link.abi");
const linkToken = new web3.eth.Contract(linkABI);

contract(
  "Verification",
  ([root, oracle, nftOwner, user1, user2, user3, unknown]) => {
    let provider;
    let link;
    let transferAndCall;

    before(async () => {
      console.log("First before");
      provider = await DummyProvider.new([user1, user2, user3]);
      link = await MockContract.new();
      transferAndCall = linkToken.methods.transferAndCall.call(0, oracle, 0, "0x0").encodeABI();
    });

    describe("smoke test", async () => {
      it("deploy()", async () => {
        await NFT.new("DMY", "Dummy", 10, 1, 100, {from: nftOwner});
      });

      it("setup verification", async () => {
        const nft = await NFT.new("DMY", "Dummy", 10, 1, 100, {from: nftOwner});
        await nft.setupVerification(
          provider.address,
          link.address,
          oracle,
          "0xc1c5e92880894eb6b27d3cae19670aa3",
          web3.utils.toBN(100000000000000000),
          {from: nftOwner}
        );
      });
    });

    describe("mint", () => {
      let nft;

      before(async () => {
        nft = await NFT.new("DMY", "Dummy", 10, 1, 100, {from: nftOwner});

        await nft.setupVerification(
          provider.address,
          link.address,
          oracle,
          "0xc1c5e92880894eb6b27d3cae19670aa3",
          web3.utils.toBN(100000000000000000),
          {from: nftOwner}
        )
      });

      describe("successfully", () => {
        let result;
        const tokenId = 1;

        before(async () => {
          await link.reset();
          await link.givenMethodReturnBool(transferAndCall, true);
        });

        it("mint()", async () => {
          result = await nft.mint(tokenId, { from: user1, value: 100 });
        });

        it("has issued a chainlink API call", async () => {
          assert.equal(1, await link.invocationCountForMethod.call(transferAndCall));
          truffleAssert.eventEmitted(result, "ChainlinkRequested");
        });

        it("has emitted a verify event", async () => {
          truffleAssert.eventEmitted(result, "Verify", {wallet: user1});
        });

        it("has reserved the NFT for the user", async() => {
          truffleAssert.eventEmitted(
            result,
            "Reserve",
            event => event.wallet === user1 && event.tokenId.toNumber() === tokenId
          );
          assert.equal(2, await nft.isMinted(tokenId));
          assert.equal(user1, await nft.reservedFor(tokenId));
        });

        it("marked the user as pending verification", async () => {
          assert.equal(true, await nft.isPendingVerification(user1));
        });
      });

      describe("should fail", () => {
        it("when NFT is already minted", async () => {
          await truffleAssert.reverts(
            nft.mint(1, { from: user2, value: 100 }),
            "token unavailable"
          );
        });

        it("when token id too low", async () => {
          await truffleAssert.reverts(
            nft.mint(0, { from: user2, value: 100 }),
            "Invalid token id"
          );
        });

        it("when token id too high", async () => {
          await truffleAssert.reverts(
            nft.mint(10000, { from: user2, value: 100 }),
            "Invalid token id"
          );
        });

        it("when there's no payment", async () => {
          await truffleAssert.reverts(
            nft.mint(2, { from: user2 }),
            "insufficient payment"
          );
        });

        it("mint by an unknown wallet", async () => {
          await truffleAssert.reverts(
            nft.mint(2, { from: unknown, value: 100 }),
            "unable to verify unknown wallet"
          );
        });
      });
    });

    describe("fulfill verification", () => {
      let nft;
      let otherToken = 10;

      before(async () => {
        await link.reset();
        await link.givenMethodReturnBool(transferAndCall, true);
      });

      before(async () => {
        nft = await NFT.new("DMY", "Dummy", 10, 10, 100, {from: nftOwner});

        await nft.setupVerification(
            provider.address,
            link.address,
            oracle,
            "0xc1c5e92880894eb6b27d3cae19670aa3",
            web3.utils.toBN(100000000000000000),
            {from: nftOwner}
        )
      });

      before(async () => {
        await nft.mint(otherToken, { from: user3, value: 100 });
      });

      describe("approved", () => {
        let result;
        let requestId;
        const tokenId = 1;
        const secondTokenId = 2;

        before(async () => {
          const result = await nft.mint(tokenId, { from: user1, value: 100 });
          requestId = result.logs.filter(e => e.event === 'ChainlinkRequested')[0].args.id;
        });

        before(async () => {
          await nft.mint(secondTokenId, { from: user1, value: 100 });
        });

        it("fulfillVerification(requestId, true)", async () => {
          result = await nft.fulfillVerification(requestId, true, { from: oracle });
        });

        it("will mark the address as approved", async () => {
          assert.equal(true, await nft.isApproved(user1));
        });

        it("will mint the token", async () => {
          truffleAssert.eventEmitted(
            result,
            "Transfer",
            event => event.to === user1 && event.tokenId.toNumber() === tokenId
          );

          assert.equal(user1, await nft.ownerOf(tokenId));
          assert.equal(0, await nft.reservedFor(tokenId));
        });

        it("will also mint the user's second token", async () => {
          truffleAssert.eventEmitted(
            result,
            "Transfer",
            event => event.to === user1 && event.tokenId.toNumber() === secondTokenId
          );

          assert.equal(user1, await nft.ownerOf(secondTokenId));
          assert.equal(0, await nft.reservedFor(secondTokenId));
        });

        it("will not unlock other tokens", async () => {
          assert.equal(user3, await nft.reservedFor(otherToken));
        });
      });

      describe("declined", () => {
        let requestId;
        const tokenId = 3;

        before(async () => {
          const result = await nft.mint(tokenId, { from: user2, value: 100 });
          requestId = result.logs.filter(e => e.event === 'ChainlinkRequested')[0].args.id;
        });

        it("fulfillVerification(requestId, false)", async () => {
          await nft.fulfillVerification(requestId, false, { from: oracle });
        });

        it("will mark the address as declined", async () => {
          assert.equal(true, await nft.isDeclined(user2));
        });

        it("will make the token available again", async () => {
          assert.equal(0, await nft.isMinted(tokenId));
        });
      });
    });

    describe("mint by verified user", () => {
      let nft;

      before(async () => {
        nft = await NFT.new("DMY", "Dummy", 10, 10, 100, {from: nftOwner});

        await nft.setupVerification(
            provider.address,
            link.address,
            oracle,
            "0xc1c5e92880894eb6b27d3cae19670aa3",
            web3.utils.toBN(100000000000000000),
            {from: nftOwner}
        )
      });

      describe("approved user", () => {
        let result;
        const tokenId = 1;

        before(async () => {
          const result = await nft.mint(10, {from: user1, value: 100});
          const requestId = result.logs.filter(e => e.event === 'ChainlinkRequested')[0].args.id;
          await nft.fulfillVerification(requestId, true, {from: oracle});
        });

        before(async () => {
          await link.reset();
          await link.givenMethodReturnBool(transferAndCall, true);
        });

        it("mint()", async () => {
          result = await nft.mint(tokenId, { from: user1, value: 100 });

          truffleAssert.eventEmitted(
            result,
            "Transfer",
            event => event.to === user1 && event.tokenId.toNumber() === tokenId
          );

          assert.equal(user1, await nft.ownerOf(tokenId));
        });

        it("has not issued a chainlink API call", async () => {
          assert.equal(0, await link.invocationCountForMethod.call(transferAndCall));
          truffleAssert.eventNotEmitted(result, "ChainlinkRequested");
        });
      });

      describe("declined user", () => {
        const tokenId = 2;

        before(async () => {
          const result = await nft.mint(9, {from: user2, value: 100});
          const requestId = result.logs.filter(e => e.event === 'ChainlinkRequested')[0].args.id;
          await nft.fulfillVerification(requestId, false, {from: oracle});
        });

        before(async () => {
          await link.reset();
          await link.givenMethodReturnBool(transferAndCall, true);
        });

        it("should not be able to mint", async () => {
          await truffleAssert.reverts(
            nft.mint(tokenId, { from: user2, value: 100 }),
            "wallet is declined"
          );
        });
      });
    });
  }
);
