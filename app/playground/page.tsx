import { redirect } from 'next/navigation';

export default function PlaygroundPage() {
  redirect('/canvas?view=playground');
}
