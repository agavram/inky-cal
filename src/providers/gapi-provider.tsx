'use client';

import { TODAY, getEnd, getStart } from '@/src/components/calendar';
import { useQuery } from '@tanstack/react-query';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import Script from 'next/script';
import { useEffect } from 'react';

const DISCOVERY_DOC =
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

export const gapiAtom = atom<typeof gapi | null>(null);
export const tokenAtom = atomWithStorage<string>(
  'google-token',
  '',
  createJSONStorage(),
  { getOnInit: true },
);
export const tokenClientAtom = atom<google.accounts.oauth2.TokenClient | null>(
  null,
);

export function GoogleProvider() {
  const [token, setToken] = useAtom(tokenAtom);
  const [g, setGapi] = useAtom(gapiAtom);
  const setTokenClient = useSetAtom(tokenClientAtom);

  useEffect(() => {
    if (!g) return;
    g.client.setToken({ access_token: token });
  }, [token, g]);

  return (
    <>
      <Script
        async
        defer
        src="https://apis.google.com/js/api.js"
        onLoad={() => {
          gapi.load('client', async () => {
            await gapi.client.init({
              apiKey: process.env.NEXT_PUBLIC_API_KEY,
              discoveryDocs: [DISCOVERY_DOC],
            });
            setGapi(gapi);
          });
        }}
      ></Script>
      <Script
        async
        defer
        src="https://accounts.google.com/gsi/client"
        onLoad={() => {
          const tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: process.env.NEXT_PUBLIC_CLIENT_ID ?? '',
            scope: SCOPES,
            callback: (resp) => {
              if (resp.error) {
                return;
              }
              setToken(resp.access_token);
            },
          });
          setTokenClient(tokenClient);
        }}
      ></Script>
    </>
  );
}

export const useCalendarEvents = () => {
  const g = useAtomValue(gapiAtom);
  const [token, setToken] = useAtom(tokenAtom);

  return useQuery<gapi.client.calendar.Event[]>({
    queryKey: ['calendars', token, g?.client],
    queryFn: async () => {
      const calendars: gapi.client.calendar.CalendarList = JSON.parse(
        await g!.client.calendar.calendarList.list().then(
          (res) => res.body,
          (err) => {
            setToken('');
            throw err;
          },
        ),
      );

      return (
        await Promise.allSettled(
          calendars!.items.map((cal) => {
            return g!.client.calendar.events.list({
              calendarId: cal.id,
              timeMin: TODAY.toISOString(),
              timeMax: new Date(
                TODAY.getTime() + 86400000 * 3,
              ).toISOString(),
              showDeleted: false,
              singleEvents: true,
            });
          }),
        )
      )
        .map((r) => r.status === 'fulfilled' && JSON.parse(r.value.body).items)
        .filter((r) => !!r)
        .flat()
        .sort((a, b) => {
          const diff = getStart(a).unix() - getStart(b).unix();
          return diff === 0 ? getEnd(a).unix() - getEnd(b).unix() : diff;
        });
    },
    enabled: !!token && !!g?.client,
    refetchOnMount: false,
  });
};
