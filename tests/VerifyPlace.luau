--//LuauProgrammer
--//VerifyPlace
--//2026-11-08
--!strict

local Fs = require("@lune/fs")
local Roblox = require("@lune/roblox")

local function ReadSource(Node: Roblox.Instance): string
	assert(Node:IsA("LuaSourceContainer"), "Expected a script source")
	-- Lune's Instance types do not narrow class properties after IsA.
	return (Node :: Roblox.Instance & { Source: string }).Source
end

local Staging = Roblox.deserializePlace(Fs.readFile("build/Staging.rbxlx"))
local Local = Roblox.deserializePlace(Fs.readFile("places/Baseplate.rbxlx"))

assert(Staging:FindFirstChild("Workspace") == nil, "Staging must not contain a world")
assert(Staging:FindFirstChild("Lighting") == nil, "Staging must not change Lighting")
assert(Staging:FindFirstChild("SoundService") == nil, "Staging must not change SoundService")

local Sources: { [string]: string } = {}
local EntryPoints = 0
for _, Node in Staging:GetDescendants() do
	if Node:IsA("LuaSourceContainer") then
		local Path = Node:GetFullName()
		assert(not string.find(Path, "DAATests", 1, true), "Tests leaked into staging")
		assert(not string.find(Path, "StartupProbe", 1, true), "Fixtures leaked into staging")
		Sources[Path] = ReadSource(Node)
		if Node:IsA("Script") or Node:IsA("LocalScript") then
			EntryPoints += 1
		end
	end
end
assert(EntryPoints == 2, "Expected exactly one server and one client bootstrap")

local Compared = 0
for _, Node in Local:GetDescendants() do
	local Source = Sources[Node:GetFullName()]
	if Source ~= nil then
		assert(ReadSource(Node) == Source, "Production sources differ: " .. Node:GetFullName())
		Compared += 1
	end
end
local Expected = 0
for _ in Sources do
	Expected += 1
end
assert(Compared == Expected, "Local place is missing production modules")

local Replicated = Staging:FindFirstChild("ReplicatedStorage")
local Server = Staging:FindFirstChild("ServerScriptService")
assert(Replicated ~= nil and Server ~= nil, "Missing code services")
local SharedDAA = Replicated:FindFirstChild("DAA")
local ServerDAA = Server:FindFirstChild("DAA")
assert(SharedDAA ~= nil and ServerDAA ~= nil, "Missing DAA folders")
local SharedPackages = SharedDAA:FindFirstChild("Packages")
local ServerPackages = ServerDAA:FindFirstChild("Packages")
assert(SharedPackages ~= nil and ServerPackages ~= nil, "Missing package folders")
for _, Name in
	{
		"Trove",
		"Signal",
		"Promise",
		"Comm",
		"Input",
		"Component",
		"Spring",
		"Shake",
		"EnumList",
		"Loader",
		"Log",
		"Tree",
		"TableUtil",
		"WaitFor",
		"Timer",
		"Silo",
		"Option",
	}
do
	assert(SharedPackages:FindFirstChild(Name) ~= nil, "Missing shared package: " .. Name)
end
assert(ServerPackages:FindFirstChild("ProfileStore") ~= nil, "Missing server ProfileStore")
assert(SharedPackages:FindFirstChild("ProfileStore") == nil, "ProfileStore is exposed to clients")

local Workspace = Local:FindFirstChild("Workspace")
assert(Workspace ~= nil and Workspace:FindFirstChild("Baseplate") ~= nil, "Local baseplate missing")
assert(Workspace:FindFirstChild("Spawn") ~= nil, "Local spawn missing")
local ReplicatedFirst = Local:FindFirstChild("ReplicatedFirst")
assert(ReplicatedFirst ~= nil and ReplicatedFirst:FindFirstChild("DAATests") ~= nil, "Local tests missing")
assert(SharedPackages:FindFirstChild("Net") == nil, "Removed Net package is still installed")
print("Place checks passed: two entry points, all packages, identical code, local world excluded")
