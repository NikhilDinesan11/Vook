"use client";
import React, { useState } from "react";
import HomeCard from "./HomeCard";
import { useRouter } from "next/navigation";
import MeetingModal from "./MeetingModal";
import { useUser } from "@clerk/nextjs";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useToast } from "./ui/use-toast";
import { Textarea } from "./ui/textarea";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Input } from "./ui/input";

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setmeetingState] = useState<
    "isScheduleMeeting" | "isJoiningMeeting" | "isInstantMeeting" | undefined
  >();
  const { user } = useUser();
  const client = useStreamVideoClient();
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: "",
    link: "",
  });
  const [callDetails, setcallDetails] = useState<Call>();
  const { toast } = useToast();

  const createMeeting = async () => {
    if (!values.dateTime) {
      toast({
        title: "Please select a date and a time",
      });
      return;
    }
    if (!client || !user) return;
    try {
      const id = crypto.randomUUID();
      const call = client.call("default", id);
      if (!call) throw new Error("Failed to create call");
      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || "Instant Meeting";
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });
      setcallDetails(call);
      if (!values.description) {
        router.push(`/meeting/${call.id}`);
        toast({
          title: "Meeting created",
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Failed to create meeting",
      });
    }
  };

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`;

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <HomeCard
        img="/icons/add-meeting.svg"
        className="bg-orange-1"
        title="New Meeting"
        description="Start an instant meeting"
        handleClick={() => {
          setmeetingState("isInstantMeeting");
        }}
      />
      <HomeCard
        img="/icons/schedule.svg"
        title="Schedule Meeting"
        className="bg-blue-1"
        description="Plan your meeting"
        handleClick={() => {
          setmeetingState("isScheduleMeeting");
        }}
      />
      <HomeCard
        img="/icons/recordings.svg"
        title="View Recordings"
        className="bg-purple-1"
        description="Check out your Recordings"
        handleClick={() => {
          router.push("/recordings");
        }}
      />
      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        className="bg-yellow-1"
        description="via invitation link"
        handleClick={() => {
          setmeetingState("isJoiningMeeting");
        }}
      />
      {!callDetails ? (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setmeetingState(undefined)}
          title="Create Meeting"
          handleClick={createMeeting}
        >
          <div className="flex flex-col gap-2.5">
            <label className="text-base text-normal leading-[22px] text-sky-2">
              Add a description
            </label>
            <Textarea
              className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
              onChange={(e) => {
                setValues({ ...values, description: e.target.value });
              }}
            />
          </div>
          <div className="flex w-full flex-col gap-2.5">
            <label className="text-base text-normal leading-[22px] text-sky-2">
              Select Date and Time
            </label>
            <DatePicker
              className="bg-dark-3 text-white w-full rounded p-2 focus:outline none"
              selected={values.dateTime}
              onChange={(date) =>
                setValues({
                  ...values,
                  dateTime: date!,
                })
              }
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
            />
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setmeetingState(undefined)}
          title="Meeting Created"
          className="text-center"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({ title: "Link Copied" });
          }}
          image="/icons/checked.svg"
          buttonIcon="/icons/copy.svg"
          buttonText="Copy Meeting Link"
        />
      )}

      <MeetingModal
        isOpen={meetingState === "isInstantMeeting"}
        onClose={() => setmeetingState(undefined)}
        title="Start an instant Meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={createMeeting}
      />

      <MeetingModal
        isOpen={meetingState === "isJoiningMeeting"}
        onClose={() => setmeetingState(undefined)}
        title="Type the link here"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={() => router.push(values.link)}
      >
        <Input
          placeholder="Meeting Link"
          className="border-none bg-dark-3 focus:visible:ring-0 focuse:visible:ring-offset-0"
          onChange={(e) => setValues({ ...values, link: e.target.value })}
        />
      </MeetingModal>
    </section>
  );
};

export default MeetingTypeList;
