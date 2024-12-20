import DirectoryManager from "@/components/DirectoryManager/DirectoryManager";

export default function Home() {
    return (
        <div className="min-h-screen p-8 flex items-center justify-center">
            <div className="w-full max-w-7xl">
                <h1 className="text-3xl font-bold mb-8 text-white">
                    Directory Management System
                </h1>
                <main className="flex gap-6 justify-center">
                    {/* Commands Reference Box */}
                    <div className="w-[500px] h-fit bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                        <h2 className="font-medium text-xl mb-4">Available Commands</h2>
                        <hr className="border-white/20 mb-6"/>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-4">
              <span
                  className="inline-block px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-white font-mono">
                CREATE
              </span>
                            <span className="font-mono">directory/path</span>

                            <span
                                className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-white font-mono">
                MOVE
              </span>
                            <span className="font-mono">source/path destination/path</span>

                            <span
                                className="inline-block px-3 py-1 bg-red-500/20 border border-red-500/30 rounded text-white font-mono">
                DELETE
              </span>
                            <span className="font-mono">directory/path</span>

                            <span
                                className="inline-block px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-white font-mono">
                LIST
              </span>
                            <span className="font-mono"></span>
                        </div>
                    </div>

                    {/* Main Directory Manager */}
                    <div className="flex-1 bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                        <DirectoryManager/>
                    </div>
                </main>
            </div>
        </div>
    );
}