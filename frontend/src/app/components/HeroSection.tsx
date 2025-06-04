import React from "react";
import VerticalLine from "./ui/VerticalLine";
import Image from "next/image";
import Button from "./ui/Button";

export default function HeroSection() {
  return (
    <div className="w-full max-h-[500px] flex flex-row justify-center items-center text-text">
      {/* IMAGE SECTION */}
      <section className="w-2/3 ml-24 flex flex-col justify-center items-start">
        <h2 className="text-xl font-body font-bold p-2">JOIN OUR COMMUNITY</h2>
        <Image
          src="/review-typewriter-image.png"
          alt="Review typewriter"
          width={600}
          height={400}
          className=""
        />
      </section>

      <VerticalLine className="h-[500px]" />

      {/* TEXT & CTA SECTION */}
      <section className="w-1/3 m-24 text-justify">
        <p className="font-body text-lg text-right">XX JUN XX</p>
        <h2 className="text-3xl font-heading py-3">
          Make Headlines —{" "}
          <span className="text-accent">Start Writing Reviews Today. </span>
        </h2>
        <p className="font-body font-extralight text-2xl tracking-wider leading-8 pb-5 ">
          Put your name in print. Share honest takes on local spots and help
          your neighbors discover what’s worth their time.
          <br></br>
          <br></br>
          No subscription required — just your voice.
        </p>
        <Button size="xl" className="w-full">
          SIGN UP
        </Button>
      </section>
    </div>
  );
}
