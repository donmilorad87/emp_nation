import { useTranscription } from '@daily-co/daily-react';

export default function Transcription()  {
  const { isTranscribing } = useTranscription();

  return <div>{!isTranscribing ? 'Not' : ''} transcribing</div>;
};
