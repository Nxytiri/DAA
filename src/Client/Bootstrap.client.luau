--//LuauProgrammer
--//ClientBootstrap
--//2026-11-08
--!strict

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local DAA = ReplicatedStorage:WaitForChild("DAA")
local Loader = require(DAA:WaitForChild("Packages"):WaitForChild("Loader"))
local Log = require(DAA.Packages:WaitForChild("Log"))
local Promise = require(DAA.Packages:WaitForChild("Promise"))
local Types = require(DAA:WaitForChild("Shared"):WaitForChild("Types"))
local Logger = Log.new()

local Controllers: { [string]: Types.Startup } =
	Loader.LoadChildren(script.Parent:WaitForChild("Controllers"))
for _, Controller in Controllers do
	Controller:Init()
end

for Name, Controller in Controllers do
	Promise.try(Controller.Start, Controller):catch(function(Message: unknown)
		Logger:AtError():Log(("[DAA/%s] Start failed: %s"):format(Name, tostring(Message)))
	end)
end
