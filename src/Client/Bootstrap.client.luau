--//LuauProgrammer
--//ClientBootstrap
--//2026-11-08
--!strict

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local DAA = ReplicatedStorage:WaitForChild("DAA")
local Loader = require(DAA:WaitForChild("Packages"):WaitForChild("Loader"))
local Types = require(DAA:WaitForChild("Shared"):WaitForChild("Types"))

local Controllers: { [string]: Types.Startup } =
	Loader.LoadChildren(script.Parent:WaitForChild("Controllers"))
Loader.SpawnAll(Controllers, "OnStart")
