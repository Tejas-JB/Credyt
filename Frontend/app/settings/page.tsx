import React from 'react';
import Navigation from '../components/Navigation';

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-darkText">Manage your account preferences and wallet configuration</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar navigation */}
          <div className="md:col-span-1">
            <div className="card h-full">
              <h2 className="text-xl font-bold mb-6">Settings</h2>
              <nav className="space-y-1">
                {[
                  { name: 'Account', icon: '👤' },
                  { name: 'Security', icon: '🔒' },
                  { name: 'Appearance', icon: '🎨' },
                  { name: 'Notifications', icon: '🔔' },
                  { name: 'Network', icon: '🌐' },
                  { name: 'Privacy', icon: '👁️' },
                  { name: 'Advanced', icon: '⚙️' },
                ].map((item, index) => (
                  <button
                    key={index}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                      index === 0 ? 'bg-primary/10 text-primary' : 'text-darkText hover:text-lightText hover:bg-card/60'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
          
          {/* Main content */}
          <div className="md:col-span-3">
            {/* Account Settings */}
            <div className="card mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Account Settings</h2>
                <button className="btn-primary">Save Changes</button>
              </div>
              
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-3xl">
                    JD
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium mb-2">Profile Picture</h3>
                    <p className="text-darkText text-sm mb-4">Upload a profile picture or use a generated avatar</p>
                    <div className="flex gap-3">
                      <button className="btn-secondary text-sm">Upload Image</button>
                      <button className="btn bg-card border border-gray-700 text-darkText hover:text-lightText hover:border-primary text-sm">Generate Avatar</button>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-800 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-darkText text-sm mb-2">Display Name</label>
                      <input 
                        type="text" 
                        value="John Doe" 
                        className="w-full rounded-lg bg-card border border-gray-700 py-2 px-4 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-darkText text-sm mb-2">Email Address</label>
                      <input 
                        type="email" 
                        value="john.doe@example.com" 
                        className="w-full rounded-lg bg-card border border-gray-700 py-2 px-4 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-darkText text-sm mb-2">Default Currency</label>
                      <select className="w-full rounded-lg bg-card border border-gray-700 py-2 px-4 text-sm focus:outline-none focus:border-primary">
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                        <option>GBP (£)</option>
                        <option>JPY (¥)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-darkText text-sm mb-2">Timezone</label>
                      <select className="w-full rounded-lg bg-card border border-gray-700 py-2 px-4 text-sm focus:outline-none focus:border-primary">
                        <option>UTC-8 (Pacific Time)</option>
                        <option>UTC-5 (Eastern Time)</option>
                        <option>UTC+0 (GMT)</option>
                        <option>UTC+1 (Central European Time)</option>
                        <option>UTC+8 (China Standard Time)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Security Settings */}
            <div className="card mb-6">
              <h2 className="text-xl font-bold mb-6">Security Settings</h2>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-card/60 rounded-lg">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-darkText text-sm">Add an extra layer of security to your account</p>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-3 text-accent">Enabled</span>
                    <div className="w-12 h-6 bg-accent rounded-full flex items-center p-1">
                      <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-card/60 rounded-lg">
                  <div>
                    <h3 className="font-medium">Limit Wallet Connections</h3>
                    <p className="text-darkText text-sm">Restrict which applications can connect to your wallet</p>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-3 text-darkText">Disabled</span>
                    <div className="w-12 h-6 bg-gray-700 rounded-full flex items-center p-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-card/60 rounded-lg">
                  <div>
                    <h3 className="font-medium">Transaction Approval</h3>
                    <p className="text-darkText text-sm">Require confirmation before executing transactions</p>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-3 text-accent">Enabled</span>
                    <div className="w-12 h-6 bg-accent rounded-full flex items-center p-1">
                      <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button className="btn-secondary">Change Password</button>
                </div>
              </div>
            </div>
            
            {/* Appearance Settings */}
            <div className="card">
              <h2 className="text-xl font-bold mb-6">Appearance Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Theme</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="border-2 border-primary rounded-lg p-2 cursor-pointer">
                      <div className="h-20 rounded bg-background flex items-end">
                        <div className="w-full h-8 bg-card rounded-t-lg"></div>
                      </div>
                      <div className="text-center mt-2 text-sm font-medium">Dark</div>
                    </div>
                    <div className="border border-gray-700 rounded-lg p-2 cursor-pointer">
                      <div className="h-20 rounded bg-gray-100 flex items-end">
                        <div className="w-full h-8 bg-white rounded-t-lg"></div>
                      </div>
                      <div className="text-center mt-2 text-sm font-medium text-darkText">Light</div>
                    </div>
                    <div className="border border-gray-700 rounded-lg p-2 cursor-pointer">
                      <div className="h-20 rounded bg-background flex items-end">
                        <div className="w-full h-8 bg-indigo-900 rounded-t-lg"></div>
                      </div>
                      <div className="text-center mt-2 text-sm font-medium text-darkText">Midnight</div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-800 pt-6">
                  <h3 className="font-medium mb-4">Accent Color</h3>
                  <div className="flex flex-wrap gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 ring-2 ring-white ring-offset-2 ring-offset-background cursor-pointer"></div>
                    <div className="w-8 h-8 rounded-full bg-purple-500 cursor-pointer"></div>
                    <div className="w-8 h-8 rounded-full bg-green-500 cursor-pointer"></div>
                    <div className="w-8 h-8 rounded-full bg-yellow-500 cursor-pointer"></div>
                    <div className="w-8 h-8 rounded-full bg-red-500 cursor-pointer"></div>
                    <div className="w-8 h-8 rounded-full bg-pink-500 cursor-pointer"></div>
                  </div>
                </div>
                
                <div className="border-t border-gray-800 pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-medium">Compact Mode</h3>
                      <p className="text-darkText text-sm">Reduce padding and spacing throughout the interface</p>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-3 text-darkText">Off</span>
                      <div className="w-12 h-6 bg-gray-700 rounded-full flex items-center p-1">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="btn-primary">Apply Changes</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 