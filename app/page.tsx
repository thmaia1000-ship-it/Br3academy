import Academy from './components/Academy';
import {getChatGPTUser,chatGPTSignInPath,chatGPTSignOutPath} from './chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Page(){const u=await getChatGPTUser();return <Academy signedIn={!!u} signin={chatGPTSignInPath('/')} signout={chatGPTSignOutPath('/')} />}
