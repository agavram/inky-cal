'use client';

import { Calendar } from '@/src/components/calendar';
import Configure, { Config, formAtom } from '@/src/components/configure';
import {
  tokenAtom,
  tokenClientAtom,
  useCalendarEvents,
} from '@/src/providers/gapi-provider';
import { useMutation } from '@tanstack/react-query';
import cn from 'classnames';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import * as htmlToImage from 'html-to-image';
import 'jimp';
import { useAtom, useAtomValue } from 'jotai';
import { RESET } from 'jotai/utils';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRef } from 'react';

declare const Jimp: typeof import('jimp');
dayjs.extend(advancedFormat);

const sendCalToInky = async (
  { host, apiKey: payload, apiKeyId: authEntity }: Config,
  calendar: HTMLDivElement,
) => {
  const VIAM = await import('@viamrobotics/sdk');
  const { GenericClient } = await import('@/src/inky');

  const robot = await VIAM.createRobotClient({
    host,
    credential: {
      type: 'api-key',
      payload,
    },
    authEntity,
    signalingAddress: 'https://app.viam.com:443',
  });

  const imageData = await htmlToImage.toPng(calendar);

  const image = await Jimp.read(imageData);
  image.background(0xffffffff);
  const buffer = await image.resize(800, 480).getBufferAsync(Jimp.MIME_JPEG);
  const b64Image = buffer.toString('base64');

  const inky = new GenericClient(robot, 'inky-display');

  await inky.doCommand({
    command: 'set_image',
    image: b64Image,
  });

  await inky.doCommand({
    command: 'set_border',
    color: 0,
  });

  await inky.doCommand({
    command: 'show',
  });
};

function Home() {
  const tokenClient = useAtomValue(tokenClientAtom);
  const [form, setForm] = useAtom(formAtom);
  const [token, setToken] = useAtom(tokenAtom);

  const calendar = useRef<HTMLDivElement>(null);

  const { data: events, isLoading: isLoadingEvents } = useCalendarEvents();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      await sendCalToInky(form, calendar.current!);
    },
  });

  return (
    <main className="pb-10">
      <h1 className="text-6xl font-black">Inky Cal</h1>
      <h2 className="pb-6 pt-2 text-xl font-normal">
        Sync your Google Calendar to an e-paper display
      </h2>
      {isLoadingEvents && <Loader2 className="size-6 animate-spin" />}
      {events && <Calendar ref={calendar} events={events} />}
      {!!events && (
        <>
          <div className="flex flex-row gap-3 pt-6">
            <button
              className={cn(
                'flex flex-row items-center rounded-md border-2 border-black p-2 font-bold',
                !isPending && 'hover:bg-gray-500/10',
                isPending && 'border-gray-500 bg-gray-500/5 text-gray-500',
              )}
              disabled={isPending}
              onClick={() => mutate()}
            >
              Send to Inky
              {isPending && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
            </button>
            <button
              className="rounded-md border-2 border-black p-2 font-bold hover:bg-gray-500/10"
              onClick={() => {
                google.accounts.oauth2.revoke(token, () => {});
                setToken('');
                setForm(RESET);
              }}
            >
              Sign Out
            </button>
          </div>
          {error && (
            <p className="inline-block bg-white font-bold uppercase text-red-500">
              Unable to upload to Inky
            </p>
          )}
          <Configure />
        </>
      )}
      {!token && (
        <button
          className="rounded-md border-2 border-black p-2 font-bold hover:bg-gray-500/10"
          onClick={() => {
            tokenClient?.requestAccessToken({ prompt: 'consent' });
          }}
        >
          Get Started
        </button>
      )}
    </main>
  );
}

export default dynamic(() => Promise.resolve(Home), {
  ssr: false,
});
