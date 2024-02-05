import { useAtom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

export type Config = {
  host: string;
  apiKey: string;
  apiKeyId: string;
};

export const formAtom = atomWithStorage<Config>(
  'form',
  { host: '', apiKey: '', apiKeyId: '' },
  createJSONStorage(),
  {
    getOnInit: true,
  },
);

export default function Configure() {
  const [form, setForm] = useAtom(formAtom);

  return (
    <form className="flex max-w-96 flex-col gap-2 pt-2">
      <input
        className="rounded-md border-2 border-black py-0.5 pl-1"
        type="text"
        placeholder="Host"
        value={form.host}
        onChange={(e) => {
          setForm({ ...form, host: e.target.value });
        }}
      />
      <input
        className="rounded-md border-2 border-black py-0.5 pl-1"
        type="password"
        placeholder="API Key"
        autoComplete="password"
        value={form.apiKey}
        onChange={(e) => {
          setForm({ ...form, apiKey: e.target.value });
        }}
      />
      <input
        className="rounded-md border-2 border-black py-0.5 pl-1"
        type="password"
        placeholder="API Key ID"
        autoComplete="password"
        value={form.apiKeyId}
        onChange={(e) => {
          setForm({ ...form, apiKeyId: e.target.value });
        }}
      />
    </form>
  );
}
