import express from 'express';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
    const app = express();
    const PORT = 3000;

    app.use(express.json());

    // API for code execution
    app.post('/api/execute', async (req, res) => {
        const { code, language, testCases } = req.body;

        if (!code || !language || !testCases) {
            return res.status(400).json({ error: 'Missing code, language, or testCases' });
        }

        const results = [];
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-exec-'));

        try {
            for (let i = 0; i < testCases.length; i++) {
                const tc = testCases[i];
                let execCommand = '';
                let execArgs = [];
                let fileName = '';

                if (language === 'python' || language === 'python3') {
                    fileName = path.join(tempDir, 'solution.py');
                    await fs.writeFile(fileName, code);
                    execCommand = 'python3';
                    execArgs = [fileName];
                } else if (language === 'cpp') {
                    fileName = path.join(tempDir, 'solution.cpp');
                    const binaryName = path.join(tempDir, 'solution');
                    await fs.writeFile(fileName, code);
                    
                    // Compile C++
                    const compile = spawn('g++', [fileName, '-o', binaryName]);
                    const compileExitCode = await new Promise((resolve) => {
                        compile.on('close', resolve);
                    });

                    if (compileExitCode !== 0) {
                        results.push({
                            status: 'Compile Error',
                            actual: '',
                            expected: tc.output,
                            error: 'Compilation failed'
                        });
                        continue;
                    }
                    execCommand = binaryName;
                    execArgs = [];
                } else {
                    return res.status(400).json({ error: 'Unsupported language' });
                }

                const startTime = process.hrtime();
                const child = spawn(execCommand, execArgs);

                let stdout = '';
                let stderr = '';

                child.stdin.write(tc.input + '\n');
                child.stdin.end();

                child.stdout.on('data', (data) => {
                    stdout += data.toString();
                });

                child.stderr.on('data', (data) => {
                    stderr += data.toString();
                });

                const exitCode = await new Promise((resolve) => {
                    const timeout = setTimeout(() => {
                        child.kill();
                        resolve('timeout');
                    }, 5000);

                    child.on('close', (code) => {
                        clearTimeout(timeout);
                        resolve(code);
                    });
                });

                const diff = process.hrtime(startTime);
                const timeInSeconds = (diff[0] + diff[1] / 1e9).toFixed(3);

                if (exitCode === 'timeout') {
                    results.push({
                        status: 'TLE',
                        time: timeInSeconds,
                        actual: stdout.trim(),
                        expected: tc.output.trim(),
                        error: 'Time Limit Exceeded'
                    });
                } else {
                    const actualOutput = stdout.trim();
                    const expectedOutput = tc.output.trim();
                    const isCorrect = actualOutput === expectedOutput;

                    results.push({
                        status: isCorrect ? 'AC' : 'WA',
                        time: timeInSeconds,
                        actual: actualOutput,
                        expected: expectedOutput,
                        stderr: stderr.trim()
                    });
                }
            }

            res.json({ results });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error during execution' });
        } finally {
            // Cleanup
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
            } catch (e) {
                console.error('Failed to cleanup temp dir:', e);
            }
        }
    });

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
