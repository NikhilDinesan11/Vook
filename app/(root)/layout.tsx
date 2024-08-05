import StreamVideoProvider from "@/providers/StreamClientProviders";
import { Metadata } from "next";
import React, { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Vook",
  description: "Video Calling app",
  icons:{icon:'/icons/video-cam.svg'}
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main>
      <StreamVideoProvider>
      {children}
      </StreamVideoProvider>
    </main>
  );
};

export default RootLayout;
