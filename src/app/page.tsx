import { BackbriefApp } from "../components/backbrief-app";
import { sampleDiff, sampleSession } from "../lib/sample";

export default function Home() {
  return <BackbriefApp sampleDiff={sampleDiff} sampleSession={sampleSession} />;
}
