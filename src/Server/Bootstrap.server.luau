--//LuauProgrammer
--//ServerBootstrap
--//2026-11-08
--!strict

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Loader = require(ReplicatedStorage.DAA.Packages.Loader)
local Promise = require(ReplicatedStorage.DAA.Packages.Promise)
local Types = require(ReplicatedStorage.DAA.Shared.Types)

local Services: { [string]: Types.Startup } = Loader.LoadChildren(script.Parent.Services)
for _, Service in Services do
	Service:Init()
end

for Name, Service in Services do
	Promise.try(Service.Start, Service):catch(function(Message: unknown)
		warn(("[DAA/%s] Start failed: %s"):format(Name, tostring(Message)))
	end)
end
