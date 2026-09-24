#include <iostream>
#include <vector>
#include <csignal>
#include <unistd.h>
#include <yaml-cpp/yaml.h>
#include <gpiod.hpp>

class Valve {
    int pin;
    bool active_low;
    bool dry_run;
    gpiod::line line; 

public:
    Valve(int p, bool al, bool dr) : pin(p), active_low(al), dry_run(dr) {}

    void open() {
        if (dry_run) {
            std::cout << "[SIMULARE] Valva pe pinul " << pin << " DESCHISA" << std::endl;
        } else {
            std::cout << "VALVA " << pin << " DESCHISA (Hardware)" << std::endl;
        }
    }

    void close() {
        if (dry_run) {
            std::cout << "[SIMULARE] Valva pe pinul " << pin << " INCHISA" << std::endl;
        } else {
            std::cout << "VALVA " << pin << " INCHISA (Hardware)" << std::endl;
        }
    }
};

bool running = true;
void signalHandler(int signum) {
    std::cout << "\n[SISTEM] Semnal primit! Închidere de siguranță..." << std::endl;
    running = false;
}

int main() {
    signal(SIGINT, signalHandler);

    YAML::Node config;
    try {
        config = YAML::LoadFile("config.yaml");
    } catch (...) {
        std::cerr << "Eroare: Nu pot citi config.yaml!" << std::endl;
        return 1;
    }

    bool is_dry_run = config["sistem"]["dry_run"].as<bool>(true);
    std::vector<Valve> valve;

    for (const auto& node : config["zone"]) {
        bool al = (node["tip_releu"].as<std::string>("active_high") == "active_low");
        valve.emplace_back(node["pin_gpio"].as<int>(), al, is_dry_run);
    }

    std::cout << "Sistem pornit. Mod simulare: " << (is_dry_run ? "DA" : "NU") << std::endl;
    
    while(running) {
        for (auto& v : valve) {
            v.open();
            sleep(2);
            v.close();
        }
        sleep(5); 
    }

    std::cout << "Sistem oprit." << std::endl;
    return 0;
}
