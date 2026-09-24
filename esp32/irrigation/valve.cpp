class Valve {
    int pin;
    bool active_low;
public:
    Valve(int p, bool al) : pin(p), active_low(al) {}
    
    void open() {
        std::cout << "VALVA " << pin << " DESCHISA" << std::endl;
    }
    
    void close() {
        std::cout << "VALVA " << pin << " INCHISA" << std::endl;
    }
};
