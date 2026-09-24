using System;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Photino.NET;

namespace EloDesktop;

public class Program
{
    [STAThread]
    public static void Main(string[] args)
    {
        Console.WriteLine("ELO Desktop Client (.NET 10 macOS)");

        string appDir = AppDomain.CurrentDomain.BaseDirectory;
        string wwwrootDir = Path.Combine(appDir, "wwwroot");
        string indexPath = Path.Combine(wwwrootDir, "index.html");

        if (!File.Exists(indexPath))
        {
            // Fallback development path
            string devPath = Path.GetFullPath(Path.Combine(appDir, "..", "..", "..", "..", "elo-core", "src", "elo_core", "static", "index.html"));
            if (File.Exists(devPath))
            {
                indexPath = devPath;
            }
        }

        var window = new PhotinoWindow()
            .SetTitle("ELO — Autonomous AI Operating Layer")
            .SetUseOsDefaultSize(false)
            .SetSize(1400, 920)
            .Center()
            .SetResizable(true)
            .RegisterWebMessageReceivedHandler((object sender, string message) =>
            {
                var w = (PhotinoWindow)sender;
                try
                {
                    using var doc = JsonDocument.Parse(message);
                    var root = doc.RootElement;
                    if (root.TryGetProperty("action", out var actionProp))
                    {
                        string action = actionProp.GetString() ?? "";
                        if (action == "get_system_info")
                        {
                            var info = new
                            {
                                os = Environment.OSVersion.ToString(),
                                arch = System.Runtime.InteropServices.RuntimeInformation.ProcessArchitecture.ToString(),
                                is_macos = true,
                                runtime = ".NET 10.0 (Native ARM64 / Apple Metal)"
                            };
                            w.SendWebMessage(JsonSerializer.Serialize(new { type = "system_info_reply", data = info }));
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[C# IPC Error]: {ex.Message}");
                }
            });

        if (File.Exists(indexPath))
        {
            window.Load(indexPath);
        }
        else
        {
            window.LoadRawString(@"<!DOCTYPE html><html><body style='background:#0d090a;color:#f5ecec;font-family:sans-serif;text-align:center;padding:50px;'><h1>ELO Desktop Core</h1><p>Starting up AI Operating Layer...</p></body></html>");
        }

        window.WaitForClose();
    }
}
