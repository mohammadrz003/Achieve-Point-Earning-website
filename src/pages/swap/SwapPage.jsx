import React, { useState } from "react";
import { FiShare } from "react-icons/fi";
import { BsFillHexagonFill } from "react-icons/bs";
import { BiTransfer } from "react-icons/bi";
import { ethers } from "ethers";
import axios from "axios";

import SwapSelectedToken from "../../components/SwapSelectedToken";
import { API, images, TOKEN } from "../../constants";
import styles from "./SwapPage.module.css";
import tokenABI from "../../abi.json";
import toast from "react-hot-toast";

const SwapPage = ({
  userProfile,
  onRefresherHelperHandler,
  onToggleVisibility,
  loading,
  setLoading,
}) => {
  const [inputValues, setInputValues] = useState({
    busdAmount: "0",
    apeAmount: "0",
  });

  const inputChangeHandler = (name, value) => {
    if (name === "busdAmount") {
      setInputValues((curState) => {
        return { [name]: value, apeAmount: (+value * 1) / 4 };
      });
    } else {
      setInputValues((curState) => {
        return { [name]: value, busdAmount: (+value * 4) / 1 };
      });
    }
  };

  const submitHandler = async () => {
    try {
      if (!(Number(inputValues.busdAmount) > 0)) {
        toast.error("Enter a valid amount");
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const tokenAddress = TOKEN.busdContract;

      const token = new ethers.Contract(tokenAddress, tokenABI, signer);

      setLoading(true);
      const transaction = await token.transfer(
        TOKEN.projectOwnerRecipientAddress,
        ethers.utils.parseUnits(inputValues.busdAmount, "ether")
      );

      const { data } = await axios.post(
        `${API.API_URL}/tokenTransfer/approveBusdPayment`,
        {
          user: {
            email: userProfile.email,
            Wallet: userProfile.Wallet,
          },
          transaction: transaction,
          transferedBusdAmount: Number(inputValues.busdAmount),
          network: TOKEN.networkType === "MAINNET" ? "MAINNET" : "TESTNET",
        }
      );
      setLoading(false);
      onRefresherHelperHandler();
      onToggleVisibility();
      toast.success(data.message, {
        position: "top-center",
        duration: 6000,
      });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    // <Layout>
    //   <section className=" w-full bg-[#EEEEEE]">
    //     <div className="flex justify-center items-center container px-5 py-10 mx-auto min-h-[calc(100vh-68px)] lg:min-h-[calc(100vh-78px)]">
    <div
      className={`${styles.swapBoxContainer} rounded-lg p-6 w-full max-w-lg bg-white relative z-50`}
    >
      <div className="w-full flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="font-bold text-gray-800">Apecoin price instantly</h3>
          <h5 className="text-gray-700 text-xs">May 10 th 2021, 3:15:23 pm</h5>
        </div>
        <button
          type="button"
          className={`${styles.shareButton} rounded-xl p-3`}
        >
          <FiShare className="w-5 h-5 text-black" />
        </button>
      </div>
      <div className="flex flex-col items-start mt-5 relative space-y-3">
        <div className="w-full flex flex-col space-y-2">
          <span className="text-gray-600 text-xs font-medium">You send</span>
          <SwapSelectedToken
            img={images.busdLogo}
            tokenSymbol="BUSD"
            name="busdAmount"
            onChangeHandler={inputChangeHandler}
            inputValue={inputValues.busdAmount}
          />
        </div>

        <button
          className={`absolute top-1/2 z-20 transform -translate-y-[50%] right-0`}
        >
          <BsFillHexagonFill className="w-14 h-14 text-[#5F3DFF]" />
          <BiTransfer className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90 text-2xl text-white" />
        </button>

        <div className="w-full flex flex-col space-y-2">
          <span className="text-gray-600 text-xs font-medium">You receive</span>
          <SwapSelectedToken
            img={images.starTokenLogo}
            tokenSymbol="APE"
            name="apeAmount"
            onChangeHandler={inputChangeHandler}
            inputValue={inputValues.apeAmount}
          />
        </div>
      </div>
      <button
        onClick={submitHandler}
        type="button"
        className="disabled:opacity-50 disabled:cursor-not-allowed w-full text-center bg-cyan-500 text-white rounded-xl mt-6 px-3 py-3 font-semibold"
        disabled={loading}
      >
        {loading ? "Processing..." : "Buy Ape Token"}
      </button>
    </div>
    //     </div>
    //   </section>
    // </Layout>
  );
};

export default SwapPage;